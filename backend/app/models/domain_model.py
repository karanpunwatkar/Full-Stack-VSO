from pydantic import BaseModel
from typing import Optional

# 👉 Input model — what the frontend POST body sends
class DomainCreate(BaseModel):
    domain: str          # frontend sends { domain: "example.com" }

# 👉 Full domain model — stored in MongoDB & returned to frontend
class Domain(BaseModel):
    id: int
    domain: str
    ip_address: Optional[str] = None
    registrar: Optional[str] = None
    expiry_date: Optional[str] = None
    status: Optional[str] = None           # "safe" | "low risk" | "suspicious" | "malicious"
    threat_score: int = 0
    open_ports: Optional[str] = None       # JSON string e.g. "[80, 443]"
    ssl_valid: Optional[str] = None        # "yes" | "no"
    notes: Optional[str] = None
    last_scanned: Optional[str] = None
    created_at: Optional[str] = None