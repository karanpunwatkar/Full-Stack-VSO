import { Alert, getSeverityClass } from "@/lib/mock-data";
import { AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AlertItemProps {
  alert: Alert;
}

const statusIcons = {
  active: AlertTriangle,
  acknowledged: Clock,
  resolved: CheckCircle,
};

export function AlertItem({ alert }: AlertItemProps) {
  const Icon = statusIcons[alert.status];

  return (
    <div className="card-cyber p-4 flex items-start gap-4">
      <div className={`mt-0.5 shrink-0 ${alert.status === "resolved" ? "text-success" : alert.severity === "critical" ? "text-destructive" : "text-warning"}`}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-current/10">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-display font-semibold text-sm text-foreground">{alert.title}</h4>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-mono uppercase tracking-wider ${getSeverityClass(alert.severity)}`}>
            {alert.severity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{alert.description}</p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
          <span>{alert.domainName}</span>
          <span className="text-border">|</span>
          <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
    </div>
  );
}
