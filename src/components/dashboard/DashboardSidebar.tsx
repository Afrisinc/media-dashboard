import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ArrowUpRight,
  Newspaper,
  Settings,
  Globe,
  Sparkles,
  LogOut,
  Workflow,
  Bot,
  BarChart3,
  Building2,
  BookOpen,
  Rss,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getRuntimeConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Media Studio", url: "/media", icon: Newspaper },
  { title: "Post Studio", url: "/studio", icon: Sparkles },
  { title: "Story Studio", url: "/stories", icon: BookOpen },
  { title: "News Desk", url: "/news", icon: Rss },
  { title: "Brands", url: "/brands", icon: Building2 },
  { title: "Automation", url: "/automation", icon: Workflow },
  { title: "AI Agents", url: "/agents", icon: Bot },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const bottomItems = [{ title: "Settings", url: "/settings", icon: Settings }];

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

interface NavItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate: () => void;
}

function NavItem({
  title,
  url,
  icon: Icon,
  active,
  onNavigate,
}: Readonly<NavItemProps>) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={title}
        isActive={active}
        className={cn(
          "transition-colors duration-200",
          active
            ? "bg-primary/15 font-semibold text-primary hover:bg-primary/20 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        )}
      >
        <Link
          to={url}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { setOpenMobile, state, toggleSidebar, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  // The mobile drawer overlays the page, so following a link must dismiss it.
  const closeMobile = () => setOpenMobile(false);
  const websiteUrl = getRuntimeConfig().websiteUrl;

  const isActive = (url: string) => location.pathname === url;

  const handleSignOut = async () => {
    await signOut();
    const config = getRuntimeConfig();
    window.location.href = config.authUiUrl || "/";
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-background"
    >
      <SidebarHeader
        className={cn(
          "border-b border-border/50 transition-[padding] duration-200",
          collapsed ? "px-2 py-4" : "px-4 py-6",
        )}
      >
        <Link
          to="/"
          onClick={closeMobile}
          aria-label="Afrisinc Media OS home"
          className={cn(
            "group flex items-center gap-3 transition-opacity duration-200 hover:opacity-80",
            collapsed && "justify-center",
          )}
        >
          <img
            src="/afrisic-logo.png"
            alt=""
            className={cn(
              "flex-shrink-0 object-contain transition-all duration-200",
              collapsed ? "h-8 w-8" : "h-10 w-10",
            )}
          />
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-bold leading-tight text-foreground">
                Afrisinc
              </span>
              <span className="text-xs text-muted-foreground">Media OS</span>
            </div>
          )}
        </Link>
        {!collapsed && <div className="kente-border mt-4" />}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainItems.map((item) => (
                <NavItem
                  key={item.title}
                  {...item}
                  active={isActive(item.url)}
                  onNavigate={closeMobile}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {bottomItems.map((item) => (
                <NavItem
                  key={item.title}
                  {...item}
                  active={isActive(item.url)}
                  onNavigate={closeMobile}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 py-3">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Website"
              className="text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                aria-label="Website, opens in a new tab"
              >
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-sm">Website</span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 flex-shrink-0 opacity-60"
                  aria-hidden
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={handleSignOut}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {!isMobile && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={`Expand sidebar (${isMac ? "⌘" : "Ctrl+"}B)`}
                onClick={toggleSidebar}
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <PanelLeftClose className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="flex-1 text-sm">Collapse</span>
                <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  {isMac ? "⌘B" : "Ctrl B"}
                </kbd>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
