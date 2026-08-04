import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import { useAutopilot } from "@/contexts/AutopilotContext";
import { cn } from "@/lib/utils";

export const DashboardHeader = () => {
  const { user } = useAuth();
  const { setOpen } = useCommandPalette();
  const { autopilot, setAutopilot } = useAutopilot();

  // Get initials from email or name
  const getInitials = () => {
    if (!user) return "U";
    const email = user.email || "";
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between gap-3 px-3 sm:px-6">
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="relative hidden md:block w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search media, campaigns, agents…"
            className="pl-10 pr-4 py-2 bg-muted rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 sm:gap-3">
        <Button
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={() => setOpen(true)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Create</span>
          <span className="ml-0.5 hidden rounded bg-shell/20 px-1.5 py-0.5 text-[10.5px] font-bold md:inline">
            ⌘K
          </span>
        </Button>
        <button
          onClick={() => setAutopilot(!autopilot)}
          className={cn(
            "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold whitespace-nowrap sm:px-3.5",
            autopilot
              ? "border-emerald/35 bg-emerald/10 text-emerald"
              : "border-terra/35 bg-terra/10 text-terra",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              autopilot ? "bg-emerald animate-pulse" : "bg-terra",
            )}
          />
          <span className="hidden sm:inline">
            {autopilot ? "Autopilot on" : "Human-in-loop"}
          </span>
        </button>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative hidden sm:inline-flex"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-terra" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
          {getInitials()}
        </div>
      </div>
    </header>
  );
};
