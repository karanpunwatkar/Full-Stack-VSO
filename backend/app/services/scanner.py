import socket
import ssl
import json
import random
import datetime
import subprocess


def _resolve_ip(domain: str) -> str | None:
    """Try to resolve the domain to an IP address."""
    try:
        return socket.gethostbyname(domain)
    except Exception:
        return None


def _check_ssl(domain: str) -> str:
    """Check if the domain has a valid SSL certificate."""
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(5)
            s.connect((domain, 443))
            cert = s.getpeercert()
            # Check expiry
            not_after = cert.get("notAfter", "")
            if not_after:
                expiry = datetime.datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                if expiry < datetime.datetime.utcnow():
                    return "no"
            return "yes"
    except Exception:
        return "no"


def _probe_ports(domain: str) -> list[int]:
    """Probe a set of common ports and return the open ones."""
    common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 8080, 8443]
    open_ports: list[int] = []
    for port in common_ports:
        try:
            with socket.create_connection((domain, port), timeout=1):
                open_ports.append(port)
        except Exception:
            pass
    return open_ports


def _compute_threat_score(
    ssl_valid: str,
    open_ports: list[int],
    ip_resolved: bool,
) -> tuple[int, str]:
    """
    Compute a deterministic-ish threat score (0-100) and status label.
    Higher = more dangerous.
    """
    score = 0

    # No IP → likely not a real domain or DNS blocked
    if not ip_resolved:
        score += 30

    # Bad SSL
    if ssl_valid == "no":
        score += 25

    # Risky ports
    risky = {21, 22, 23, 25, 110, 143, 445, 3306, 3389}
    risky_open = risky & set(open_ports)
    score += len(risky_open) * 8

    # Many open ports in general
    score += len(open_ports) * 2

    # Cap at 100
    score = min(score, 100)

    if score <= 20:
        status = "safe"
    elif score <= 40:
        status = "low risk"
    elif score <= 65:
        status = "suspicious"
    else:
        status = "malicious"

    return score, status


def scan_domain(domain: str) -> dict:
    """
    Full domain scan.  Returns a dict matching the DomainAPI frontend shape
    (minus id / created_at which the caller fills in).
    """
    ip = _resolve_ip(domain)
    ssl_valid = _check_ssl(domain)
    open_ports = _probe_ports(domain)

    threat_score, status = _compute_threat_score(
        ssl_valid=ssl_valid,
        open_ports=open_ports,
        ip_resolved=bool(ip),
    )

    return {
        "ip_address": ip,
        "ssl_valid": ssl_valid,
        "open_ports": json.dumps(open_ports),
        "threat_score": threat_score,
        "status": status,
        "last_scanned": datetime.datetime.utcnow().isoformat(),
    }