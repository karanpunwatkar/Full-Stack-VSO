import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Zap } from "lucide-react";

const threats = [
  { icon: Shield, text: "SSL scan completed for acmecorp.com — 82/100", color: "text-success" },
  { icon: AlertTriangle, text: "Critical: Port 8080 exposed on acmecorp.com", color: "text-destructive" },
  { icon: Zap, text: "DMARC misconfiguration detected on legacyapp.net", color: "text-warning" },
  { icon: Shield, text: "securestartup.io — All checks passed ✓", color: "text-success" },
  { icon: AlertTriangle, text: "SSL Certificate expired on legacyapp.net", color: "text-destructive" },
  { icon: Zap, text: "New subdomain discovered: staging.acmecorp.com", color: "text-warning" },
];

export function LiveThreatTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % threats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = threats[index];
  const Icon = current.icon;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card/50 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="live-indicator shrink-0">LIVE</div>
        <div className="h-4 w-px bg-border" />
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm"
          >
            <Icon className={`h-3.5 w-3.5 shrink-0 ${current.color}`} />
            <span className="text-muted-foreground font-mono text-xs truncate">{current.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
