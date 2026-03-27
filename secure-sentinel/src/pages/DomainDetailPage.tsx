import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { SecurityScoreRing } from "@/components/SecurityScoreRing";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Shield, Lock, Globe, Server, AlertTriangle,
  CheckCircle, XCircle, ScanLine, Loader2, Wifi, WifiOff,
  Activity, Calendar, Cpu, Info, Zap, RefreshCw, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, DomainAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "unknown";
  const color =
    s === "safe" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" :
    s === "low risk" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" :
    s === "suspicious" ? "text-orange-400 bg-orange-400/10 border-orange-400/30" :
    s === "malicious" ? "text-red-400 bg-red-400/10 border-red-400/30" :
    "text-muted-foreground bg-muted/20 border-border/30";
  return (
    <span className={`text-[11px] font-mono px-3 py-1 rounded-full border uppercase tracking-wider ${color}`}>
      {s}
    </span>
  );
}

function ScoreBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-muted-foreground">{label}</span>
        <span className={color}>{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color.replace("text-", "bg-")}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, color = "text-muted-foreground" }: {
  icon: any; label: string; value: string | null; color?: string;
}) {
  return (
    <div className="card-cyber p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground font-mono">{value ?? "—"}</p>
    </div>
  );
}

// ─── Threat breakdown from raw scan data ────────────────────────────────────

function buildReportItems(domain: DomainAPI) {
  const ports: number[] = domain.open_ports ? JSON.parse(domain.open_ports) : [];
  const riskyPorts = [21, 23, 3306, 3389];

  const items: {
    id: string; icon: any; title: string; description: string;
    status: "pass" | "warn" | "fail"; category: string;
    fix?: string;
  }[] = [];

  // SSL
  if (domain.ssl_valid === "yes") {
    items.push({ id: "ssl", icon: Lock, title: "SSL Certificate Valid", category: "SSL/TLS",
      description: "A valid SSL/TLS certificate was found on port 443.", status: "pass" });
  } else if (domain.ssl_valid === "no") {
    items.push({ id: "ssl", icon: Lock, title: "SSL Certificate Invalid or Missing", category: "SSL/TLS",
      description: "No valid SSL certificate was detected on port 443. Visitors will see security warnings.",
      status: "fail", fix: "Install/renew an SSL certificate via Let's Encrypt or your hosting provider." });
  }

  // Open ports
  if (ports.length === 0 && domain.last_scanned) {
    items.push({ id: "ports_ok", icon: Server, title: "No Risky Ports Detected", category: "Ports",
      description: "No well-known vulnerable ports were found open.", status: "pass" });
  }
  ports.forEach((p) => {
    const risky = riskyPorts.includes(p);
    items.push({
      id: `port_${p}`, icon: Server, category: "Ports",
      title: `Port ${p} is ${risky ? "Open (Risky)" : "Open"}`,
      description: risky
        ? `Port ${p} is open and associated with a high-risk service (FTP/Telnet/MySQL/RDP). This can be exploited.`
        : `Port ${p} is publicly accessible. Verify this is intentional.`,
      status: risky ? "fail" : "warn",
      fix: risky ? `Close port ${p} in your firewall or restrict access to trusted IPs only.` : undefined,
    });
  });

  // IP resolution
  if (domain.ip_address) {
    items.push({ id: "ip", icon: Globe, title: "Domain Resolves Successfully", category: "DNS",
      description: `Domain resolves to IP ${domain.ip_address}.`, status: "pass" });
  } else if (domain.last_scanned) {
    items.push({ id: "ip_fail", icon: Globe, title: "Domain Did Not Resolve", category: "DNS",
      description: "The domain could not be resolved to an IP address. It may be down or misconfigured.",
      status: "fail", fix: "Check your DNS records and ensure the domain is correctly configured." });
  }

  // WHOIS
  if (domain.registrar) {
    items.push({ id: "whois", icon: Shield, title: "WHOIS Data Available", category: "Registration",
      description: `Registered via ${domain.registrar}${domain.expiry_date ? `. Expires ${domain.expiry_date}` : ""}.`,
      status: "pass" });
  }

  // Threat score summary
  if (domain.threat_score >= 60) {
    items.push({ id: "threat_high", icon: AlertTriangle, title: "High Threat Score Detected", category: "Threat Intel",
      description: `Threat score is ${domain.threat_score}/100. Multiple risk factors were identified.`,
      status: "fail", fix: "Review all failing checks below and address them in order of severity." });
  } else if (domain.threat_score >= 20) {
    items.push({ id: "threat_med", icon: AlertTriangle, title: "Moderate Threat Score", category: "Threat Intel",
      description: `Threat score is ${domain.threat_score}/100. Some risks were identified.`, status: "warn" });
  } else if (domain.last_scanned) {
    items.push({ id: "threat_ok", icon: Activity, title: "Low Threat Score", category: "Threat Intel",
      description: `Threat score is ${domain.threat_score}/100. Domain appears clean.`, status: "pass" });
  }

  return items;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DomainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [domain, setDomain] = useState<DomainAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [remediationLoading, setRemediationLoading] = useState<Record<string, boolean>>({});
  const [remediationData, setRemediationData] = useState<Record<string, string>>({});
  const [resolvingLoading, setResolvingLoading] = useState<Record<string, boolean>>({});
  const [executiveReport, setExecutiveReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    if (!domain) return;
    setGeneratingReport(true);
    try {
      const { report } = await api.getDomainExecutiveReport(domain.id);
      setExecutiveReport(report);
      toast({ title: "AI Executive Report Generated 📄", description: "Your comprehensive domain summary is ready." });
    } catch (err: any) {
      toast({ title: "Failed to generate AI report", description: err.message, variant: "destructive" });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleResolveIssue = async (itemId: string) => {
    if (!domain) return;
    setResolvingLoading((prev) => ({ ...prev, [itemId]: true }));

    let issueType = "";
    let value: string | undefined = undefined;

    if (itemId === "ssl") {
      issueType = "ssl";
    } else if (itemId.startsWith("port_")) {
      issueType = "port";
      value = itemId.replace("port_", "");
    } else if (itemId === "ip_fail") {
      issueType = "ip_fail";
    }

    try {
      if (!issueType) throw new Error("Automatic resolution unavailable for this issue.");
      const updated = await api.resolveIssue(domain.id, issueType, value);
      setDomain(updated);
      toast({ title: "Issue resolved ✅", description: `Simulated fix applied. Threat score updated to ${updated.threat_score}/100` });
    } catch (err: any) {
      toast({ title: "Failed to resolve issue", description: err.message, variant: "destructive" });
    } finally {
      setResolvingLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleGetRemediation = async (itemId: string, issue: string) => {
    if (!domain) return;
    setRemediationLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      const { remediation_plan } = await api.getRemediationPlan(domain.domain, issue);
      setRemediationData((prev) => ({ ...prev, [itemId]: remediation_plan }));
    } catch (err: any) {
      toast({ title: "Failed to get AI remediation", description: err.message, variant: "destructive" });
    } finally {
      setRemediationLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const fetchDomain = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getDomain(Number(id));
      setDomain(data);
    } catch (err: any) {
      toast({ title: "Domain not found", description: err.message, variant: "destructive" });
      navigate("/domains");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDomain(); }, [fetchDomain]);

  const handleScan = async () => {
    if (!domain) return;
    setScanning(true);
    try {
      const updated = await api.scanDomain(domain.id);
      setDomain(updated);
      toast({ title: "Scan complete ✅", description: `${updated.domain} — threat score: ${updated.threat_score}/100` });
    } catch (err: any) {
      toast({ title: "Scan failed", description: err.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          <span className="font-mono text-sm">Loading domain…</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!domain) return null;

  const notScanned = !domain.last_scanned;
  const reportItems = buildReportItems(domain);
  const passes = reportItems.filter((r) => r.status === "pass").length;
  const warns = reportItems.filter((r) => r.status === "warn").length;
  const fails = reportItems.filter((r) => r.status === "fail").length;

  // Map threat score (0–100) to a security score (100–0 inverted)
  const securityScore = Math.max(0, 100 - domain.threat_score);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => navigate("/domains")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3 flex-wrap">
              {domain.domain}
              <StatusBadge status={domain.status} />
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              {notScanned ? "Not yet scanned — click Scan to generate a report" :
                `Last scanned ${new Date(domain.last_scanned!).toLocaleString()}`}
            </p>
          </div>
          <Button
            size="sm"
            className="gradient-cyber-bg text-primary-foreground font-semibold cyber-glow shrink-0"
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning…</>
            ) : (
              <><ScanLine className="mr-2 h-4 w-4" />{notScanned ? "Run Scan" : "Re-Scan"}</>
            )}
          </Button>
        </div>

        {/* Not yet scanned banner */}
        {notScanned && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-cyber p-6 text-center border-dashed"
          >
            <ScanLine className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-mono text-sm">No scan data yet.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Click "Run Scan" above to analyse this domain.</p>
          </motion.div>
        )}

        {/* Score + Stats (only after scan) */}
        {!notScanned && (
          <AnimatePresence>
            {/* Score row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Score ring */}
              <div className="card-cyber p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl" />
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 relative">Security Score</p>
                <div className="relative">
                  <SecurityScoreRing score={securityScore} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 font-mono relative">Threat: {domain.threat_score}/100</p>
              </div>

              {/* Info grid */}
              <div className="md:col-span-2 grid grid-cols-2 gap-3">
                <InfoCard icon={Globe} label="IP Address" value={domain.ip_address} color="text-primary" />
                <InfoCard icon={Lock} label="SSL Status"
                  value={domain.ssl_valid === "yes" ? "✓ Valid" : domain.ssl_valid === "no" ? "✗ Invalid" : "Unknown"}
                  color={domain.ssl_valid === "yes" ? "text-emerald-400" : "text-red-400"} />
                <InfoCard icon={Server} label="Open Ports"
                  value={domain.open_ports
                    ? (JSON.parse(domain.open_ports) as number[]).join(", ") || "None"
                    : "None"}
                  color="text-orange-400" />
                <InfoCard icon={Shield} label="Registrar" value={domain.registrar} />
                <InfoCard icon={Calendar} label="Expires" value={domain.expiry_date} />
                <InfoCard icon={Zap} label="Threat Score"
                  value={`${domain.threat_score}/100`}
                  color={domain.threat_score >= 60 ? "text-red-400" : domain.threat_score >= 20 ? "text-orange-400" : "text-emerald-400"} />
              </div>
            </motion.div>

            {/* Threat bars */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-cyber p-6"
            >
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" /> Risk Breakdown
              </h3>
              <div className="space-y-4">
                <ScoreBar label="Threat Score" value={domain.threat_score} color="text-red-400" />
                <ScoreBar label="Security Score" value={securityScore} color="text-emerald-400" />
                <div className="flex gap-6 pt-2 text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" /> {passes} passed
                  </span>
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> {warns} warnings
                  </span>
                  <span className="flex items-center gap-1.5 text-red-400">
                    <XCircle className="h-3.5 w-3.5" /> {fails} failed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Scan Report */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-primary" /> Scan Report
                </h2>
                <Button
                  size="sm"
                  className="gradient-cyber-bg text-primary-foreground font-semibold cyber-glow"
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Everything…</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate AI Executive Report</>
                  )}
                </Button>
              </div>

              {/* Executive Report Render Block */}
              <AnimatePresence>
                {executiveReport && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-8"
                  >
                    <div className="p-6 md:p-8 rounded-xl bg-background/50 backdrop-blur-md border border-primary/30 text-sm text-foreground/90 markdown-format prose prose-invert prose-p:leading-relaxed prose-headings:text-primary max-w-none prose-a:text-primary shadow-[0_0_20px_rgba(0,255,170,0.1)]">
                      <div className="flex items-center gap-2 mb-6 text-primary font-mono text-xs uppercase tracking-widest pb-4 border-b border-primary/20">
                        <Cpu className="h-5 w-5" /> Comprehensive Artificial Intelligence Executive Summary
                      </div>
                      <ReactMarkdown>{executiveReport}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-3">
                {reportItems.map((item, i) => {
                  const Icon = item.icon;
                  const statusColor =
                    item.status === "pass" ? "text-emerald-400" :
                    item.status === "warn" ? "text-yellow-400" :
                    "text-red-400";
                  const borderColor =
                    item.status === "pass" ? "border-emerald-400/20 hover:border-emerald-400/40" :
                    item.status === "warn" ? "border-yellow-400/20 hover:border-yellow-400/40" :
                    "border-red-400/20 hover:border-red-400/40";
                  const StatusIcon =
                    item.status === "pass" ? CheckCircle :
                    item.status === "warn" ? AlertTriangle : XCircle;

                  return (
                    <motion.div
                      key={item.id}
                      className={`card-cyber p-5 border transition-colors ${borderColor}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + i * 0.04 }}
                    >
                      <div className="flex items-start gap-4">
                        <StatusIcon className={`h-5 w-5 shrink-0 mt-0.5 ${statusColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-display font-semibold text-sm text-foreground">{item.title}</h4>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground uppercase">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          {item.fix && (
                            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15">
                              <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <p className="text-xs text-foreground">{item.fix}</p>
                            </div>
                          )}

                          {(item.status === "fail" || item.status === "warn") && (
                            <div className="mt-4 border-t border-border/10 pt-4">
                              {!remediationData[item.id] ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/40 text-primary hover:bg-primary/10 text-xs shadow-[0_0_10px_rgba(0,255,170,0.15)] transition-all"
                                  onClick={() => handleGetRemediation(item.id, item.description)}
                                  disabled={remediationLoading[item.id]}
                                >
                                  {remediationLoading[item.id] ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                  ) : (
                                    <Cpu className="h-3.5 w-3.5 mr-2" />
                                  )}
                                  {remediationLoading[item.id] ? "Officer Analyzing..." : "Ask AI Officer for Step-by-Step Fix"}
                                </Button>
                              ) : (
                                <div className="p-5 rounded-xl bg-background/50 backdrop-blur-md border border-primary/20 mt-2 text-sm text-foreground/90 markdown-format prose prose-invert prose-p:leading-relaxed prose-headings:text-primary max-w-none prose-a:text-primary relative group">
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/20">
                                    <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest">
                                      <Cpu className="h-4 w-4" /> AI Security Officer Remediation Plan
                                    </div>
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20"
                                      onClick={() => handleResolveIssue(item.id)}
                                      disabled={resolvingLoading[item.id]}
                                    >
                                      {resolvingLoading[item.id] ? (
                                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                      ) : (
                                        <CheckCircle className="h-3 w-3 mr-1.5" />
                                      )}
                                      {resolvingLoading[item.id] ? "Resolving..." : "Mark as Resolved"}
                                    </Button>
                                  </div>
                                  <ReactMarkdown>{remediationData[item.id]}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}
