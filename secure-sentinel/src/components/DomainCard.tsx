import { Domain, getScoreColor } from "@/lib/mock-data";
import { Globe, AlertTriangle, CheckCircle, XCircle, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface DomainCardProps {
  domain: Domain;
}

const statusConfig = {
  secure: { icon: CheckCircle, label: "Secure", className: "text-success" },
  warning: { icon: AlertTriangle, label: "Warning", className: "text-warning" },
  critical: { icon: XCircle, label: "Critical", className: "text-destructive" },
};

export function DomainCard({ domain }: DomainCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[domain.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      className="card-cyber p-5 cursor-pointer group"
      onClick={() => navigate(`/domains/${domain.id}`)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Scan line effect */}
      <div className="scan-line opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
              {domain.name}
              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-[11px] text-muted-foreground font-mono">Last scan: {domain.lastScan}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${
          domain.status === 'secure' ? 'bg-success/10 border-success/20 text-success' :
          domain.status === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
          'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-display font-bold ${getScoreColor(domain.score)}`}>
            {domain.score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className={`w-1.5 h-1.5 rounded-full ${domain.issues > 5 ? 'bg-destructive' : domain.issues > 2 ? 'bg-warning' : 'bg-success'}`} />
          {domain.issues} {domain.issues === 1 ? "issue" : "issues"}
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: domain.score >= 80 ? 'hsl(160 100% 45%)' : domain.score >= 60 ? 'hsl(38 100% 55%)' : 'hsl(0 85% 60%)',
            boxShadow: `0 0 10px ${domain.score >= 80 ? 'hsl(160 100% 45% / 0.5)' : domain.score >= 60 ? 'hsl(38 100% 55% / 0.5)' : 'hsl(0 85% 60% / 0.5)'}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${domain.score}%` }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
