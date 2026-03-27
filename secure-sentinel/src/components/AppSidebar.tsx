import { Shield, LayoutDashboard, Globe, MessageSquare, Bell, Activity } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Domains", url: "/domains", icon: Globe },
  { title: "AI Officer", url: "/chat", icon: MessageSquare },
  { title: "Alerts", url: "/alerts", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="p-4 flex items-center gap-2.5 relative">
          <div className="w-8 h-8 rounded-lg gradient-cyber-bg flex items-center justify-center cyber-glow">
            <Shield className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-sidebar-foreground tracking-tight">
                CyberGuard
              </span>
              <span className="text-[10px] text-sidebar-foreground/40 font-mono tracking-widest uppercase">VSO Platform</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-[0.2em] font-mono">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50 transition-all duration-200 group"
                      activeClassName="bg-primary/10 text-primary font-medium border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status indicator at bottom */}
        {!collapsed && (
          <div className="mt-auto p-4">
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-medium text-sidebar-foreground">System Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-sidebar-foreground/50 font-mono">4 domains monitored</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
