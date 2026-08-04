import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { AgentsTickerBar } from "./AgentsTickerBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CommandPaletteProvider } from "@/contexts/CommandPaletteContext";
import { AutopilotProvider, useAutopilot } from "@/contexts/AutopilotContext";

const DashboardChrome = () => {
  const { autopilot } = useAutopilot();
  return (
    <div className="min-h-screen flex w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        {autopilot && <AgentsTickerBar />}
        <main className="flex-1 min-w-0 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = () => (
  <SidebarProvider>
    <AutopilotProvider>
      <CommandPaletteProvider>
        <DashboardChrome />
      </CommandPaletteProvider>
    </AutopilotProvider>
  </SidebarProvider>
);

export default DashboardLayout;
