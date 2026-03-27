import { useState, useEffect, useCallback, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus, Globe, Loader2, RefreshCw, Trash2,
  ScanLine, Wifi, WifiOff, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api, DomainAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "unknown";
  const color =
    s === "safe"        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" :
    s === "low risk"    ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"   :
    s === "suspicious"  ? "text-orange-400 bg-orange-400/10 border-orange-400/30"   :
    s === "malicious"   ? "text-red-400 bg-red-400/10 border-red-400/30"            :
                          "text-muted-foreground bg-muted/20 border-border/30";
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${color}`}>
      {s}
    </span>
  );
}

// ─── Domain row ──────────────────────────────────────────────────────────────
const DomainRow = forwardRef<HTMLDivElement, {
  domain: DomainAPI;
  onScan: (id: number) => void;
  onDelete: (id: number) => void;
  scanning: boolean;
}>(({ domain, onScan, onDelete, scanning }, ref) => {
  const navigate = useNavigate();
  const ports: number[] = domain.open_ports ? JSON.parse(domain.open_ports) : [];
  const hasReport = !!domain.last_scanned;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card-cyber p-4 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      {/* Icon + name (clickable → detail page) */}
      <button
        className="flex items-center gap-3 flex-1 min-w-0 text-left group"
        onClick={() => navigate(`/domains/${domain.id}`)}
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Globe className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
            {domain.domain}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
          </p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">
            {domain.ip_address ?? (hasReport ? "Could not resolve" : "Not scanned yet")}
          </p>
        </div>
      </button>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground">
        <StatusBadge status={domain.status} />
        {hasReport && <span title="Threat score">🎯 {domain.threat_score}/100</span>}
        {domain.ssl_valid === "yes" && (
          <span className="text-emerald-400 flex items-center gap-1">
            <Wifi className="h-3 w-3" /> SSL ✓
          </span>
        )}
        {domain.ssl_valid === "no" && (
          <span className="text-red-400 flex items-center gap-1">
            <WifiOff className="h-3 w-3" /> SSL ✗
          </span>
        )}
        {ports.length > 0 && (
          <span className="text-orange-400">
            ⚠ {ports.length} port{ports.length > 1 ? "s" : ""}
          </span>
        )}
        {hasReport && (
          <span className="hidden md:inline text-muted-foreground/60">
            {new Date(domain.last_scanned!).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* View Report (only after a scan) */}
        {hasReport && (
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 hover:bg-primary/10 text-primary text-xs"
            onClick={() => navigate(`/domains/${domain.id}`)}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Report
          </Button>
        )}

        {/* Scan */}
        <Button
          size="sm"
          variant="outline"
          className="border-border/50 hover:border-primary/40 hover:bg-primary/5 text-xs"
          onClick={() => onScan(domain.id)}
          disabled={scanning}
        >
          {scanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ScanLine className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5">{scanning ? "Scanning…" : hasReport ? "Re-Scan" : "Scan"}</span>
        </Button>

        {/* Delete */}
        <Button
          size="sm"
          variant="ghost"
          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
          onClick={() => onDelete(domain.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
});

// ─── Add Domain Dialog ────────────────────────────────────────────────────────
function AddDomainDialog({
  open, onClose, onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (domain: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!trimmed) return;
    setLoading(true);
    try {
      await onAdd(trimmed);
      setValue("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative card-cyber p-6 w-full max-w-md mx-4 z-10"
      >
        <h2 className="text-lg font-display font-bold text-foreground mb-1 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Add Domain
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Enter a domain to start monitoring. You can scan it after adding.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            className="w-full bg-background/60 border border-border/50 focus:border-primary/50 focus:outline-none rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground transition"
            placeholder="e.g. example.com"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !value.trim()}
              className="gradient-cyber-bg text-primary-foreground font-semibold cyber-glow"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {loading ? "Adding…" : "Add Domain"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DomainsPage() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<DomainAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningIds, setScanningIds] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scanningAll, setScanningAll] = useState(false);
  const { toast } = useToast();

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDomains();
      setDomains(data);
    } catch (err: any) {
      toast({ title: "Failed to load domains", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  const handleAdd = async (domain: string) => {
    try {
      const newDomain = await api.addDomain(domain);
      setDomains((prev) => [newDomain, ...prev]);
      toast({ title: "Domain added ✅", description: `${domain} is now monitored. Click Scan to analyse it.` });
    } catch (err: any) {
      toast({ title: "Failed to add domain", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const handleScan = async (id: number) => {
    setScanningIds((prev) => new Set(prev).add(id));
    try {
      const updated = await api.scanDomain(id);
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)));
      toast({
        title: "Scan complete 🛡️",
        description: `${updated.domain} — score: ${updated.threat_score}/100 (${updated.status})`,
      });
      // Navigate to the report after scan
      navigate(`/domains/${id}`);
    } catch (err: any) {
      toast({ title: "Scan failed", description: err.message, variant: "destructive" });
    } finally {
      setScanningIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const handleDelete = async (id: number) => {
    const domain = domains.find((d) => d.id === id);
    try {
      await api.deleteDomain(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Domain removed", description: `${domain?.domain} deleted.` });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const handleScanAll = async () => {
    setScanningAll(true);
    try {
      const updated = await api.scanAllDomains();
      setDomains(updated);
      toast({
        title: "Scan All complete 🛡️",
        description: `${updated.length} domain${updated.length !== 1 ? "s" : ""} scanned.`,
      });
    } catch (err: any) {
      toast({ title: "Scan All failed", description: err.message, variant: "destructive" });
    } finally {
      setScanningAll(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Domains
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              {loading ? "Loading…" : `${domains.length} domain${domains.length !== 1 ? "s" : ""} monitored`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-border/50 hover:border-primary/30 hover:bg-primary/5"
              onClick={fetchDomains}
              disabled={loading || scanningAll}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {domains.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 text-primary text-xs"
                onClick={handleScanAll}
                disabled={scanningAll || loading}
              >
                {scanningAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <ScanLine className="h-3.5 w-3.5 mr-1.5" />
                )}
                {scanningAll ? "Scanning All…" : "Scan All"}
              </Button>
            )}
            <Button
              size="sm"
              className="gradient-cyber-bg text-primary-foreground font-semibold cyber-glow"
              onClick={() => setDialogOpen(true)}
              disabled={scanningAll}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-3" />
            <span className="font-mono text-sm">Loading domains…</span>
          </div>
        ) : domains.length === 0 ? (
          <div className="card-cyber p-12 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono text-sm">No domains yet.</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Click "Add Domain" to get started.</p>
            <Button
              size="sm"
              className="mt-5 gradient-cyber-bg text-primary-foreground font-semibold"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Domain
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {domains.map((domain) => (
                <DomainRow
                  key={domain.id}
                  domain={domain}
                  onScan={handleScan}
                  onDelete={handleDelete}
                  scanning={scanningIds.has(domain.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Domain Dialog */}
      <AnimatePresence>
        {dialogOpen && (
          <AddDomainDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onAdd={handleAdd}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
