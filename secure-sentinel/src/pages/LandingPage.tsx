import { Shield, Scan, Brain, Bell, ArrowRight, Lock, Globe, Zap, Activity, ChevronRight, Terminal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CyberBackground } from "@/components/CyberBackground";

const features = [
  {
    icon: Scan,
    title: "Automated Scanning",
    description: "SSL, DNS, ports, email security — scanned continuously and asynchronously.",
    gradient: "from-primary/20 to-cyber-blue/20",
  },
  {
    icon: Brain,
    title: "AI Security Officer",
    description: "Plain-English vulnerability explanations with step-by-step fix guides.",
    gradient: "from-cyber-purple/20 to-primary/20",
  },
  {
    icon: Eye,
    title: "Live Score Dashboard",
    description: "Real-time 0–100 security score that updates dynamically after each fix.",
    gradient: "from-cyber-blue/20 to-cyber-purple/20",
  },
  {
    icon: Bell,
    title: "Crisis Alerts",
    description: "Instant notifications for SSL expiry, blacklisting, and data exposure.",
    gradient: "from-destructive/20 to-warning/20",
  },
];

const stats = [
  { value: "10K+", label: "Domains Secured" },
  { value: "99.9%", label: "Uptime" },
  { value: "<5min", label: "Scan Time" },
  { value: "24/7", label: "Monitoring" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/30 glass sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-cyber-bg flex items-center justify-center cyber-glow">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground tracking-tight">CyberGuard</span>
            <span className="text-[10px] font-mono text-muted-foreground tracking-widest ml-1 hidden sm:block">VSO</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Button>
            <Button size="sm" className="gradient-cyber-bg text-primary-foreground font-semibold cyber-glow" onClick={() => navigate("/dashboard")}>
              Get Started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <CyberBackground />
        <div className="absolute inset-0 cyber-grid-animated" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              AI-Powered Cybersecurity Platform
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-foreground leading-[0.95] mb-8">
              Your Virtual
              <br />
              <span className="shimmer-text">Security Officer</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Monitor domains, detect vulnerabilities, and get AI-guided fixes — all from one intelligent dashboard.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="gradient-cyber-bg text-primary-foreground font-bold px-10 h-14 text-base cyber-glow-intense rounded-xl"
                onClick={() => navigate("/dashboard")}
              >
                <Terminal className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 text-base px-10 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5"
                onClick={() => navigate("/chat")}
              >
                <Brain className="mr-2 h-4 w-4" />
                Talk to AI Officer
              </Button>
            </motion.div>

            {/* Floating terminal preview */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-16 max-w-lg mx-auto"
            >
              <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-4 text-left font-mono text-xs space-y-2 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/80" />
                  <span className="text-muted-foreground ml-2 text-[10px]">cyberguard-scan</span>
                </div>
                <p className="text-muted-foreground">$ cyberguard scan acmecorp.com</p>
                <p className="text-primary">✓ SSL Certificate: Valid (expires in 45 days)</p>
                <p className="text-warning">⚠ DMARC: Not configured</p>
                <p className="text-destructive">✗ Port 8080: Publicly accessible</p>
                <p className="text-success">✓ DNS: Properly configured</p>
                <p className="text-muted-foreground mt-1">Security Score: <span className="text-primary font-bold">82/100</span></p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/30 bg-card/30 backdrop-blur-sm relative">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="text-4xl md:text-5xl font-display font-black text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 relative">
        <div className="absolute inset-0 cyber-grid" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <motion.span
              className="text-xs font-mono text-primary tracking-widest uppercase"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Core Features
            </motion.span>
            <motion.h2
              className="text-4xl md:text-5xl font-display font-black text-foreground mt-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Everything you need to
              <br />
              <span className="text-primary">stay secure</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="card-cyber p-6 group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 border border-border/50 group-hover:border-primary/30 transition-colors`}>
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2 text-base">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
        <div className="absolute inset-0 cyber-grid-animated" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl gradient-cyber-bg flex items-center justify-center mx-auto mb-8 cyber-glow-intense">
              <Globe className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black text-foreground mb-6">
              Secure your domain
              <br />
              <span className="text-primary">in minutes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
              Add your domain and get a full security audit with actionable recommendations.
            </p>
            <Button
              size="lg"
              className="gradient-cyber-bg text-primary-foreground font-bold px-12 h-14 text-base cyber-glow-intense rounded-xl"
              onClick={() => navigate("/dashboard")}
            >
              <Zap className="mr-2 h-4 w-4" />
              Add Your Domain
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded gradient-cyber-bg flex items-center justify-center">
              <Shield className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">CyberGuard</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            © 2024 CyberGuard — Virtual Security Officer Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
