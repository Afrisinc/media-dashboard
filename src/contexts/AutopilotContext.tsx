import { createContext, useContext, type ReactNode } from "react";
import {
  useAutomationPolicy,
  useUpdateAutomationPolicy,
} from "@/hooks/useAutomation";
import type { AutomationMode, AutomationPolicy } from "@/types/accountGroup";

interface AutopilotContextValue {
  /** True when the workspace runs itself. Mirrors `policy.mode === "autopilot"`. */
  autopilot: boolean;
  setAutopilot: (value: boolean) => void;
  mode: AutomationMode;
  policy: AutomationPolicy | undefined;
  isLoading: boolean;
  isSaving: boolean;
}

const AutopilotContext = createContext<AutopilotContextValue | null>(null);

export function AutopilotProvider({ children }: { children: ReactNode }) {
  const { data: policy, isLoading } = useAutomationPolicy();
  const update = useUpdateAutomationPolicy();

  // The switch is a server setting, not a UI preference — the cron reads the
  // same row, so a toggle here changes what the agents do while nobody is here.
  const mode: AutomationMode = policy?.mode ?? "manual";

  const value: AutopilotContextValue = {
    autopilot: mode === "autopilot",
    setAutopilot: (next) =>
      update.mutate({ mode: next ? "autopilot" : "manual" }),
    mode,
    policy,
    isLoading,
    isSaving: update.isPending,
  };

  return (
    <AutopilotContext.Provider value={value}>
      {children}
    </AutopilotContext.Provider>
  );
}

export function useAutopilot() {
  const ctx = useContext(AutopilotContext);
  if (!ctx) {
    throw new Error("useAutopilot must be used within AutopilotProvider");
  }
  return ctx;
}
