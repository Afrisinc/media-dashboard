import { createContext, useContext, useState, type ReactNode } from "react";

interface AutopilotContextValue {
  autopilot: boolean;
  setAutopilot: (value: boolean) => void;
}

const AutopilotContext = createContext<AutopilotContextValue | null>(null);

export function AutopilotProvider({ children }: { children: ReactNode }) {
  const [autopilot, setAutopilot] = useState(true);
  return (
    <AutopilotContext.Provider value={{ autopilot, setAutopilot }}>
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
