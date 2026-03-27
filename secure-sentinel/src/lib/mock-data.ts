// Mock data for the cybersecurity dashboard

export interface Domain {
  id: string;
  name: string;
  addedAt: string;
  lastScan: string;
  score: number;
  status: "secure" | "warning" | "critical";
  sslExpiry: string;
  issues: number;
}

export interface ScanResult {
  id: string;
  domainId: string;
  type: "ssl" | "dns" | "email" | "ports" | "blacklist" | "subdomain";
  status: "pass" | "warning" | "fail";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  fix?: string;
  scannedAt: string;
}

export interface Alert {
  id: string;
  domainId: string;
  domainName: string;
  type: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "acknowledged";
  createdAt: string;
  resolution?: string;
}

export interface ScoreHistory {
  date: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const mockDomains: Domain[] = [
  {
    id: "1",
    name: "acmecorp.com",
    addedAt: "2024-01-15",
    lastScan: "2 hours ago",
    score: 82,
    status: "warning",
    sslExpiry: "2024-08-15",
    issues: 3,
  },
  {
    id: "2",
    name: "securestartup.io",
    addedAt: "2024-02-20",
    lastScan: "30 minutes ago",
    score: 95,
    status: "secure",
    sslExpiry: "2025-03-10",
    issues: 1,
  },
  {
    id: "3",
    name: "legacyapp.net",
    addedAt: "2023-11-05",
    lastScan: "1 day ago",
    score: 41,
    status: "critical",
    sslExpiry: "2024-02-01",
    issues: 8,
  },
  {
    id: "4",
    name: "devportal.dev",
    addedAt: "2024-03-01",
    lastScan: "5 hours ago",
    score: 73,
    status: "warning",
    sslExpiry: "2024-12-20",
    issues: 4,
  },
];

export const mockScanResults: ScanResult[] = [
  {
    id: "s1",
    domainId: "1",
    type: "ssl",
    status: "warning",
    title: "SSL Certificate Expiring Soon",
    description: "Your SSL certificate expires in 45 days. Renew it to avoid browser warnings.",
    severity: "medium",
    fix: "Renew your SSL certificate through your certificate authority or hosting provider.",
    scannedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: "s2",
    domainId: "1",
    type: "email",
    status: "fail",
    title: "DMARC Record Missing",
    description: "No DMARC record found. Your domain is vulnerable to email spoofing attacks.",
    severity: "high",
    fix: 'Add a DMARC DNS record: v=DMARC1; p=quarantine; rua=mailto:dmarc@acmecorp.com',
    scannedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: "s3",
    domainId: "1",
    type: "dns",
    status: "pass",
    title: "DNS Configuration Valid",
    description: "All DNS records are properly configured with no misconfigurations detected.",
    severity: "low",
    scannedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: "s4",
    domainId: "1",
    type: "ports",
    status: "fail",
    title: "Open Port Detected: 8080",
    description: "Port 8080 is publicly accessible. This could expose internal services.",
    severity: "critical",
    fix: "Close port 8080 in your firewall settings or restrict access to known IPs.",
    scannedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: "s5",
    domainId: "1",
    type: "blacklist",
    status: "pass",
    title: "Domain Not Blacklisted",
    description: "Your domain is clean across all major blacklist databases.",
    severity: "low",
    scannedAt: "2024-06-01T10:30:00Z",
  },
  {
    id: "s6",
    domainId: "1",
    type: "subdomain",
    status: "warning",
    title: "Leaked Subdomain Found",
    description: "staging.acmecorp.com is publicly accessible and indexed by search engines.",
    severity: "medium",
    fix: "Add authentication to staging environments or restrict access via IP whitelist.",
    scannedAt: "2024-06-01T10:30:00Z",
  },
];

export const mockAlerts: Alert[] = [
  {
    id: "a1",
    domainId: "3",
    domainName: "legacyapp.net",
    type: "ssl_expiry",
    title: "SSL Certificate Expired",
    description: "The SSL certificate for legacyapp.net has expired. Visitors will see security warnings.",
    severity: "critical",
    status: "active",
    createdAt: "2024-06-01T08:00:00Z",
    resolution: "Renew SSL certificate immediately through your hosting provider or CA.",
  },
  {
    id: "a2",
    domainId: "1",
    domainName: "acmecorp.com",
    type: "open_port",
    title: "New Open Port Detected",
    description: "Port 8080 was detected as publicly accessible on acmecorp.com.",
    severity: "high",
    status: "active",
    createdAt: "2024-06-01T10:30:00Z",
    resolution: "Close the port in your firewall or restrict to known IPs.",
  },
  {
    id: "a3",
    domainId: "1",
    domainName: "acmecorp.com",
    type: "email_security",
    title: "DMARC Not Configured",
    description: "Email spoofing protection is missing for acmecorp.com.",
    severity: "medium",
    status: "acknowledged",
    createdAt: "2024-05-28T14:00:00Z",
    resolution: "Add a DMARC DNS TXT record to your domain's DNS settings.",
  },
  {
    id: "a4",
    domainId: "4",
    domainName: "devportal.dev",
    type: "blacklist",
    title: "Domain Approaching Blacklist",
    description: "devportal.dev has been flagged on 1 spam database. Monitor closely.",
    severity: "low",
    status: "resolved",
    createdAt: "2024-05-20T09:00:00Z",
  },
  {
    id: "a5",
    domainId: "3",
    domainName: "legacyapp.net",
    type: "data_exposure",
    title: "Sensitive Data Exposure Risk",
    description: "Directory listing is enabled on legacyapp.net exposing internal files.",
    severity: "critical",
    status: "active",
    createdAt: "2024-06-02T06:00:00Z",
    resolution: "Disable directory listing in your web server configuration.",
  },
];

export const mockScoreHistory: ScoreHistory[] = [
  { date: "Jan", score: 45 },
  { date: "Feb", score: 52 },
  { date: "Mar", score: 58 },
  { date: "Apr", score: 61 },
  { date: "May", score: 72 },
  { date: "Jun", score: 78 },
  { date: "Jul", score: 82 },
];

export const chatSuggestions = [
  "Is my domain secure?",
  "How to fix SPF issue?",
  "What is DMARC and why do I need it?",
  "Explain my security score",
  "How to close open ports?",
  "What are the biggest risks right now?",
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "c1",
    role: "assistant",
    content: "Hello! I'm your Virtual Security Officer. I can help you understand your security posture, explain vulnerabilities, and guide you through fixes. What would you like to know?",
    timestamp: "2024-06-01T10:00:00Z",
  },
];

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Critical";
}

export function getSeverityClass(severity: string): string {
  switch (severity) {
    case "critical": return "severity-critical";
    case "high": return "severity-high";
    case "medium": return "severity-medium";
    case "low": return "severity-low";
    default: return "";
  }
}
