import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertItem } from "@/components/AlertItem";
import { mockAlerts } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Bell, Filter } from "lucide-react";
import { motion } from "framer-motion";

const severityFilters = ["all", "critical", "high", "medium", "low"] as const;
const statusFilters = ["all", "active", "acknowledged", "resolved"] as const;

export default function AlertsPage() {
  const [severity, setSeverity] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = mockAlerts.filter((a) => {
    if (severity !== "all" && a.severity !== severity) return false;
    if (status !== "all" && a.status !== status) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Alerts
            </h1>
            <p className="text-sm text-muted-foreground font-mono">
              {mockAlerts.filter((a) => a.status === "active").length} active alerts
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">Severity:</span>
            <div className="flex gap-1">
              {severityFilters.map((f) => (
                <Button
                  key={f}
                  variant={severity === f ? "default" : "ghost"}
                  size="sm"
                  className={`text-xs h-7 capitalize rounded-lg ${
                    severity === f ? "gradient-cyber-bg text-primary-foreground" : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => setSeverity(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">Status:</span>
            <div className="flex gap-1">
              {statusFilters.map((f) => (
                <Button
                  key={f}
                  variant={status === f ? "default" : "ghost"}
                  size="sm"
                  className={`text-xs h-7 capitalize rounded-lg ${
                    status === f ? "gradient-cyber-bg text-primary-foreground" : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  onClick={() => setStatus(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground card-cyber rounded-xl">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="font-mono text-sm">No alerts match your filters</p>
            </div>
          ) : (
            filtered.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AlertItem alert={alert} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
