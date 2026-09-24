import {
  BarChart3,
  BookOpen,
  Bot,
  Mail,
  Rss,
  type LucideIcon,
} from "lucide-react";
import type { AgentRun } from "@/types/accountGroup";
import { formatDateShort } from "@/lib/dateFormat";
import type { AgentKey, AgentLastRun, AgentStatus } from "@/types/agents";

export const AGENT_NAMES: Record<AgentKey, string> = {
  post: "Post agent",
  story: "Story agent",
  news: "News agent",
  newsletter: "Newsletter digest",
  analytics: "Analytics sync",
};

export const AGENT_SHORT_NAMES: Record<AgentKey, string> = {
  post: "Post",
  story: "Story",
  news: "News",
  newsletter: "Newsletter",
  analytics: "Analytics",
};

export const AGENT_ICONS: Record<AgentKey, LucideIcon> = {
  post: Bot,
  story: BookOpen,
  news: Rss,
  newsletter: Mail,
  analytics: BarChart3,
};

const TRIGGER_LABELS: Record<string, string> = {
  autopilot: "Agents drive",
  manual: "Run by you",
  schedule: "Scheduled",
};

export const describeTrigger = (trigger: string) =>
  TRIGGER_LABELS[trigger] ?? trigger;

export const isWorkspaceRun = (run: AgentRun) =>
  run.agentKey !== null && run.agentKey !== "post";

export const runOwnerLabel = (run: AgentRun) =>
  run.groupName ?? (run.agentKey ? AGENT_NAMES[run.agentKey] : run.agent);

export const runOutcome = (run: AgentRun) =>
  run.errorMessage ??
  [...run.steps].reverse().find((step) => step.detail)?.detail ??
  null;

export type AgentStatusTone = "running" | "waiting" | "off" | "server" | "idle";

export interface AgentStatusPill {
  label: string;
  tone: AgentStatusTone;
}

export function agentStatusPill(agent: AgentStatus): AgentStatusPill {
  if (agent.lastRun?.status === "running") {
    return { label: "Working now", tone: "running" };
  }
  if (agent.active) {
    return {
      label: agent.enabled ? "On" : "On for the workspace",
      tone: "running",
    };
  }
  switch (agent.blockedBy) {
    case "server":
      return { label: "Off on the server", tone: "server" };
    case "autopilot":
      return { label: "Waiting for Agents drive", tone: "waiting" };
    default:
      return { label: "Off", tone: "off" };
  }
}

export function describeLastRun(run: AgentLastRun | null): string {
  if (!run) {
    return "No runs yet";
  }
  const when =
    run.status === "running"
      ? "Running now"
      : `Last run ${formatDateShort(run.finishedAt ?? run.startedAt)}`;
  return [when, describeTrigger(run.trigger).toLowerCase(), run.summary]
    .filter(Boolean)
    .join(" · ");
}
