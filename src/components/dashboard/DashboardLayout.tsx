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
    <div className="min-h-dvh flex w-full bg-muted/30">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        {autopilot && <AgentsTickerBar />}
        {/* The one owner of the page gutter and max width — pages never set their own. */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-auto">
          <div className="mx-auto w-full max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const sidebarStartsOpen = () =>
  !document.cookie.split("; ").some((entry) => entry === "sidebar:state=false");

const DashboardLayout = () => (
  <SidebarProvider defaultOpen={sidebarStartsOpen()}>
    <AutopilotProvider>
      <CommandPaletteProvider>
        <DashboardChrome />
      </CommandPaletteProvider>
    </AutopilotProvider>
  </SidebarProvider>
);

export default DashboardLayout;
