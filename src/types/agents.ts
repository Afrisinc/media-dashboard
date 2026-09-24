export type AgentKey = "post" | "story" | "news" | "newsletter" | "analytics";

export type AgentScope = "user" | "workspace";

export type AgentBlocker = "server" | "switch" | "autopilot" | null;

export interface AgentSchedule {
  label: string;
  cron: string;
}

export interface AgentLastRun {
  id: string;
  status: "running" | "succeeded" | "failed" | "skipped";
  trigger: string;
  startedAt: string;
  finishedAt: string | null;
  summary: string | null;
}

export interface AgentStatus {
  key: AgentKey;
  name: string;
  description: string;
  scope: AgentScope;
  requiresAutopilot: boolean;
  enabledByDefault: boolean;
  schedules: AgentSchedule[];
  allowedByServer: boolean;
  enabled: boolean;
  chosen: boolean;
  active: boolean;
  blockedBy: AgentBlocker;
  lastRun: AgentLastRun | null;
  runsToday: number;
}

export const AGENT_SCOPE_LABELS: Record<AgentScope, string> = {
  user: "Your brands",
  workspace: "Whole workspace",
};
