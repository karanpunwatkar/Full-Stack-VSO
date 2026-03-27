import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { SecurityScoreRing } from "@/components/SecurityScoreRing";
import { AlertItem } from "@/components/AlertItem";
import { LiveThreatTicker } from "@/components/LiveThreatTicker";
import { mockAlerts, mockScoreHistory } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Scan, TrendingUp, Shield, AlertTriangle, Activity, Zap, Loader2, Globe } from "lucide-react";
import { ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { api, DomainStats } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DomainStats | null>(null);
  const [scanningAll, setScanningAll] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const activeAlerts = mockAlerts.filter((a) => a.status === "active");
  const { toast } = useToast();

  const fetchStats = () => {
    api.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleScanAll = async () => {
    setScanningAll(true);
    try {
      await api.scanAllDomains();
      toast({ title: "Scan Complete 🛡️", description: "All domains have been successfully scanned." });
      fetchStats();
    } catch (error: any) {
      toast({ title: "Scan failed", description: error.message, variant: "destructive" });
    } finally {
      setScanningAll(false);
    }
  };

  const avgScore = stats ? (stats.total > 0 ? Math.round(((stats.safe * 100) + (stats.suspicious * 40)) / Math.max(stats.total, 1)) : 0) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Security Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Monitor your security posture across all domains</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-border/50 hover:border-primary/30 hover:bg-primary/5" onClick={handleScanAll} disabled={scanningAll}>
              {scanningAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scan className="mr-2 h-4 w-4" />}
              {scanningAll ? "Scanning..." : "Scan All"}
            </Button>
            <Button size="sm" className="gradient-cyber-bg text-primary-foreground font-semibold cyber-glow" onClick={() => navigate("/domains")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Button>
          </div>
        </div>

        {/* Live Threat Ticker */}
        <LiveThreatTicker />

        {/* Score + Chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Score Card */}
          <motion.div
            className="card-cyber p-6 flex flex-col items-center justify-center relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl" />
            <h3 className="text-xs font-mono text-muted-foreground mb-4 tracking-widest uppercase relative">Overall Score</h3>
            <div className="relative">
              <SecurityScoreRing score={avgScore} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 font-mono relative">
              {loadingStats ? "…" : (stats?.total ?? 0)} domains monitored
            </p>
          </motion.div>

          {/* Chart */}
          <motion.div
            className="card-cyber p-6 lg:col-span-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono text-muted-foreground flex items-center gap-2 tracking-widest uppercase">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Score History
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Last 7 months</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockScoreHistory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160 100% 45%)" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="hsl(160 100% 45%)" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="hsl(160 100% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 15% 55%)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(220 15% 55%)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(225 25% 9%)",
                    border: "1px solid hsl(225 20% 14%)",
                    borderRadius: "10px",
                    color: "hsl(210 20% 95%)",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(160 100% 45%)"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                  dot={{ fill: "hsl(160 100% 45%)", strokeWidth: 0, r: 3 }}
                  activeDot={{ fill: "hsl(160 100% 45%)", strokeWidth: 2, stroke: "hsl(225 25% 9%)", r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Domains", value: loadingStats ? "…" : (stats?.total ?? 0), icon: Shield, color: "text-primary", bg: "from-primary/10 to-primary/5" },
            { label: "Active Alerts", value: activeAlerts.length, icon: AlertTriangle, color: "text-destructive", bg: "from-destructive/10 to-destructive/5" },
            { label: "Malicious", value: loadingStats ? "…" : (stats?.malicious ?? 0), icon: Zap, color: "text-warning", bg: "from-warning/10 to-warning/5" },
            { label: "Safe", value: loadingStats ? "…" : (stats?.safe ?? 0), icon: TrendingUp, color: "text-primary", bg: "from-primary/10 to-primary/5" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="card-cyber p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-[11px] text-muted-foreground font-mono tracking-wider uppercase">{stat.label}</span>
                </div>
                <span className="text-3xl font-display font-bold text-foreground">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Domains + Alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-mono text-muted-foreground mb-4 tracking-widest uppercase flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Your Domains
            </h2>
            <div className="card-cyber p-6 text-center">
              <p className="text-muted-foreground text-sm font-mono">View all domains and run scans</p>
              <Button size="sm" className="mt-4 gradient-cyber-bg text-primary-foreground font-semibold" onClick={() => navigate("/domains")}>
                <Globe className="mr-2 h-4 w-4" /> Go to Domains
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-mono text-muted-foreground mb-4 tracking-widest uppercase flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              Recent Alerts
            </h2>
            <div className="space-y-3">
              {mockAlerts.slice(0, 4).map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
