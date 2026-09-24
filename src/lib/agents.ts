import { BarChart3, Bot, Mail, Rss, type LucideIcon } from "lucide-react";
import type { AgentRun } from "@/types/accountGroup";
import type { AgentKey } from "@/types/agents";

export const AGENT_NAMES: Record<AgentKey, string> = {
  post: "Post agent",
  news: "News agent",
  newsletter: "Newsletter digest",
  analytics: "Analytics sync",
};

export const AGENT_SHORT_NAMES: Record<AgentKey, string> = {
  post: "Post",
  news: "News",
  newsletter: "Newsletter",
  analytics: "Analytics",
};

export const AGENT_ICONS: Record<AgentKey, LucideIcon> = {
  post: Bot,
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
