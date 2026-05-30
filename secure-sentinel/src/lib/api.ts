// API service — connects to the FastAPI backend at http://localhost:8000

const BASE_URL = import.meta.env.VITE_API_URL || "https://virtual-security-officer-backend.onrender.com";

export interface DomainAPI {
  id: number;
  domain: string;
  ip_address: string | null;
  registrar: string | null;
  expiry_date: string | null;
  status: string | null;
  threat_score: number;
  open_ports: string | null;   // JSON string, e.g. "[80, 443]"
  ssl_valid: string | null;
  notes: string | null;
  last_scanned: string | null;
  created_at: string | null;
}

export interface DomainStats {
  total: number;
  safe: number;
  suspicious: number;
  malicious: number;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Domains ---

export const api = {
  /** List all monitored domains */
  getDomains: () => request<DomainAPI[]>("/domains/"),

  /** Add a new domain (not yet scanned) */
  addDomain: (domain: string) =>
    request<DomainAPI>("/domains/", {
      method: "POST",
      body: JSON.stringify({ domain }),
    }),

  /** Get a single domain by id */
  getDomain: (id: number) => request<DomainAPI>(`/domains/${id}`),

  /** Trigger a full scan for a domain */
  scanDomain: (id: number) =>
    request<DomainAPI>(`/domains/${id}/scan`, { method: "POST" }),

  /** Mark an issue as resolved (simulate fixing it) */
  resolveIssue: (id: number, issueType: string, value?: string | number) =>
    request<DomainAPI>(`/domains/${id}/resolve-issue`, {
      method: "POST",
      body: JSON.stringify({ issue_type: issueType, value: value ? String(value) : null }),
    }),

  /** Trigger a full scan for all domains */
  scanAllDomains: () =>
    request<DomainAPI[]>(`/domains/scan-all`, { method: "POST" }),

  /** Delete a domain */
  deleteDomain: (id: number) =>
    request<void>(`/domains/${id}`, { method: "DELETE" }),

  /** Threat summary stats */
  getStats: () => request<DomainStats>("/domains/stats/summary"),

  /** Chat with the AI Virtual Security Officer */
  chat: (messages: ChatMessage[]) => {
    return request<{ response: string }>("/chat/", {
      method: "POST",
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
  },

  /** Ask AI for exact remediation plan of a security issue */
  getRemediationPlan: (domain: string, issue: string) =>
    request<{ remediation_plan: string }>("/chat/remediation", {
      method: "POST",
      body: JSON.stringify({ domain, issue }),
    }),

  /** Ask AI to generate an overarching Executive Summary for a domain */
  getDomainExecutiveReport: (domainId: number) =>
    request<{ report: string }>("/chat/domain-report", {
      method: "POST",
      body: JSON.stringify({ domain_id: domainId }),
    }),
};
