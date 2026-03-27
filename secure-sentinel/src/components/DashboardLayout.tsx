import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, Loader2, Globe, Plus, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { api, DomainAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [domains, setDomains] = useState<DomainAPI[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getDomains().then(setDomains).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryCleaned = searchQuery.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const filtered = domains.filter(d => d.domain.toLowerCase().includes(queryCleaned));
  const hasExactMatch = domains.some(d => d.domain.toLowerCase() === queryCleaned);

  const handleSearch = async (e: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const query = directQuery || queryCleaned;
    if (!query) return;
    
    setDropdownOpen(false);
    
    setIsSearching(true);
    try {
      const domains = await api.getDomains();
      const existing = domains.find(d => d.domain.toLowerCase() === query);
      
      if (existing) {
        navigate(`/domains/${existing.id}`);
      } else {
        toast({ title: "Adding domain...", description: `Initializing analysis for ${query}.` });
        const newDomain = await api.addDomain(query);
        const scanned = await api.scanDomain(newDomain.id);
        toast({ title: "Scan Complete ✅", description: `${scanned.domain} analysis completed.` });
        navigate(`/domains/${scanned.id}`);
      }
      setSearchQuery("");
    } catch (err: any) {
      toast({ title: "Search/Scan failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full cyber-grid">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 glass shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div ref={containerRef} className="hidden sm:flex items-center gap-2 relative">
                <form 
                  onSubmit={(e) => handleSearch(e)} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 focus-within:border-primary/50 transition-colors"
                >
                  {isSearching ? (
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  ) : (
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <input
                    type="text"
                    placeholder="Search or add domains..."
                    className="bg-transparent border-none focus:outline-none text-xs text-foreground placeholder-muted-foreground w-48"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setDropdownOpen(true);
                      api.getDomains().then(setDomains).catch(() => {});
                    }}
                    disabled={isSearching}
                  />
                </form>

                {/* Autocomplete Dropdown */}
                {dropdownOpen && searchQuery && (
                  <div className="absolute top-10 left-0 w-full bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                    <div className="max-h-60 overflow-y-auto p-1">
                      {filtered.map(d => (
                        <button
                          key={d.id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-primary/10 rounded-lg text-left transition-colors"
                          onClick={() => {
                            setSearchQuery("");
                            setDropdownOpen(false);
                            navigate(`/domains/${d.id}`);
                          }}
                        >
                          <Globe className="h-3.5 w-3.5 text-primary/60" />
                          <div className="flex-1 truncate">{d.domain}</div>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                            d.status === 'safe' ? 'text-emerald-400 border-emerald-400/30' :
                            d.status === 'malicious' ? 'text-red-400 border-red-400/30' : 'text-orange-400 border-orange-400/30'
                          }`}>
                            {d.status ?? 'unknown'}
                          </span>
                        </button>
                      ))}

                      {/* Add new option */}
                      {!hasExactMatch && queryCleaned && (
                        <button
                          className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-xs text-primary hover:bg-primary/10 rounded-lg text-left transition-colors border-t border-border/30"
                          onClick={() => handleSearch(null as any, queryCleaned)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <div className="flex-1 truncate">Scan new domain: <span className="font-bold">{queryCleaned}</span></div>
                          <span className="text-[9px] bg-primary/20 px-1.5 py-0.5 rounded uppercase font-mono">Enter</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="live-indicator mr-2 hidden sm:flex">MONITORING</div>
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/alerts")}>
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
              </Button>
              <div className="w-8 h-8 rounded-lg gradient-cyber-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
                U
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
