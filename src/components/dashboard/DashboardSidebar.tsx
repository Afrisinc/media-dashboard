import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Newspaper, Settings, Globe, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { getRuntimeConfig } from "@/lib/config";

const mainItems = [
  { title: "AI Content", url: "/ai-content", icon: Sparkles },
  { title: "Media", url: "/media", icon: Newspaper },
];

const bottomItems = [{ title: "Settings", url: "/settings", icon: Settings }];

export const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = async () => {
    await signOut();
    const config = getRuntimeConfig();
    window.location.href = config.authUiUrl || "/";
  };

  return (
    <Sidebar className="border-r border-border bg-background">
      <div className="px-4 py-6 border-b border-border/50">
        <Link
          to="/"
          className="group flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
        >
          <img
            src="/afrisic-logo.png"
            alt="Afrisinc"
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm leading-tight">
              Afrisinc
            </span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </Link>
      </div>
      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto px-4 py-5 border-t border-border/50 space-y-3">
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 px-2 py-2"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          Website
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 px-2 py-2 h-auto"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
          Sign Out
        </Button>
      </div>
    </Sidebar>
  );
};
