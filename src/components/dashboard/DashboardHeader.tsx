import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export const DashboardHeader = () => {
  const { user } = useAuth();

  // Get initials from email or name
  const getInitials = () => {
    if (!user) return "U";
    const email = user.email || "";
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-muted rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
          {getInitials()}
        </div>
      </div>
    </header>
  );
};
