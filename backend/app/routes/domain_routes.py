import datetime
from fastapi import APIRouter, HTTPException
from app.database import domains_collection
from app.models.domain_model import Domain, DomainCreate
from app.services.scanner import scan_domain, _compute_threat_score
import json
from pydantic import BaseModel

class ResolveIssueRequest(BaseModel):
    issue_type: str
    value: str | None = None

router = APIRouter(prefix="/api/v1/domains")

DB_UNAVAILABLE_MSG = (
    "Database unavailable: MongoDB connection failed. Check your .env credentials."
)


def _require_db():
    if domains_collection is None:
        raise HTTPException(status_code=503, detail=DB_UNAVAILABLE_MSG)


def _next_id() -> int:
    """Auto-increment integer ID (simple counter based on max existing id)."""
    doc = domains_collection.find_one({}, sort=[("id", -1)])
    return (doc["id"] + 1) if doc and "id" in doc else 1


def _doc_to_domain(doc: dict) -> dict:
    """Strip MongoDB _id and return a clean dict."""
    doc.pop("_id", None)
    return doc


# ─── POST /api/v1/domains/ — Add a new domain ────────────────────────────────
@router.post("/", response_model=Domain)
def add_domain(data: DomainCreate):
    _require_db()
    domain_str = data.domain.strip().lower().replace("https://", "").replace("http://", "").rstrip("/")
    if not domain_str:
        raise HTTPException(status_code=400, detail="Domain cannot be empty.")

    # Check duplicate
    if domains_collection.find_one({"domain": domain_str}):
        raise HTTPException(status_code=409, detail=f"'{domain_str}' is already monitored.")

    new_id = _next_id()
    now = datetime.datetime.utcnow().isoformat()

    doc = {
        "id": new_id,
        "domain": domain_str,
        "ip_address": None,
        "registrar": None,
        "expiry_date": None,
        "status": None,
        "threat_score": 0,
        "open_ports": None,
        "ssl_valid": None,
        "notes": None,
        "last_scanned": None,
        "created_at": now,
    }
    domains_collection.insert_one(doc)
    return _doc_to_domain(doc)


# ─── GET /api/v1/domains/ — List all domains ─────────────────────────────────
@router.get("/", response_model=list[Domain])
def get_domains():
    _require_db()
    docs = list(domains_collection.find({}, {"_id": 0}).sort("id", 1))
    return docs


# ─── GET /api/v1/domains/stats/summary — Threat summary ──────────────────────
@router.get("/stats/summary")
def get_stats():
    _require_db()
    total = domains_collection.count_documents({})
    safe = domains_collection.count_documents({"status": "safe"})
    suspicious = domains_collection.count_documents({"status": {"$in": ["suspicious", "low risk"]}})
    malicious = domains_collection.count_documents({"status": "malicious"})
    return {
        "total": total,
        "safe": safe,
        "suspicious": suspicious,
        "malicious": malicious,
    }


# ─── GET /api/v1/domains/{id} — Single domain ────────────────────────────────
@router.get("/{domain_id}", response_model=Domain)
def get_domain(domain_id: int):
    _require_db()
    doc = domains_collection.find_one({"id": domain_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Domain id={domain_id} not found.")
    return doc


# ─── POST /api/v1/domains/{id}/scan — Scan a single domain ───────────────────
@router.post("/{domain_id}/scan", response_model=Domain)
def scan_single(domain_id: int):
    _require_db()
    doc = domains_collection.find_one({"id": domain_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Domain id={domain_id} not found.")

    results = scan_domain(doc["domain"])
    domains_collection.update_one({"id": domain_id}, {"$set": results})

    updated = domains_collection.find_one({"id": domain_id}, {"_id": 0})
    return updated


# ─── POST /api/v1/domains/{id}/resolve-issue — Simulate resolving an issue
@router.post("/{domain_id}/resolve-issue", response_model=Domain)
def resolve_issue(domain_id: int, req: ResolveIssueRequest):
    _require_db()
    doc = domains_collection.find_one({"id": domain_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Domain id={domain_id} not found.")

    if req.issue_type == "ssl":
        doc["ssl_valid"] = "yes"
    elif req.issue_type == "port" and req.value:
        try:
            open_ports = json.loads(doc.get("open_ports") or "[]")
            port_to_remove = int(req.value)
            if port_to_remove in open_ports:
                open_ports.remove(port_to_remove)
                doc["open_ports"] = json.dumps(open_ports)
        except Exception:
            pass
    elif req.issue_type == "ip_fail":
        doc["ip_address"] = "192.168.1.1" # simulated IP
    
    # Recalculate score
    open_ports = json.loads(doc.get("open_ports") or "[]")
    threat_score, status = _compute_threat_score(
        ssl_valid=doc.get("ssl_valid"),
        open_ports=open_ports,
        ip_resolved=bool(doc.get("ip_address"))
    )
    
    doc["threat_score"] = threat_score
    doc["status"] = status
    
    domains_collection.update_one({"id": domain_id}, {"$set": {
        "ssl_valid": doc.get("ssl_valid"),
        "open_ports": doc.get("open_ports"),
        "ip_address": doc.get("ip_address"),
        "threat_score": threat_score,
        "status": status
    }})
    return doc


# ─── POST /api/v1/domains/scan-all — Scan every domain ───────────────────────
@router.post("/scan-all", response_model=list[Domain])
def scan_all():
    _require_db()
    docs = list(domains_collection.find({}, {"_id": 0}))
    for doc in docs:
        results = scan_domain(doc["domain"])
        domains_collection.update_one({"id": doc["id"]}, {"$set": results})

    updated = list(domains_collection.find({}, {"_id": 0}).sort("id", 1))
    return updated


# ─── DELETE /api/v1/domains/{id} — Remove a domain ───────────────────────────
@router.delete("/{domain_id}", status_code=204)
def delete_domain(domain_id: int):
    _require_db()
    result = domains_collection.delete_one({"id": domain_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Domain id={domain_id} not found.")