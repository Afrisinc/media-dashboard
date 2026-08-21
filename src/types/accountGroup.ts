import type { SocialPlatformKey } from "@/config/socialPlatforms";

export type AutomationMode = "manual" | "autopilot";

export type AgentRunStatus = "running" | "succeeded" | "failed" | "skipped";

export interface AccountGroupMember {
  accountId: string;
  isActive: boolean;
  platform: SocialPlatformKey;
  pageId: string;
  pageName: string | null;
  pageAvatar: string | null;
  meta: string | null;
  /** False once the underlying page was disconnected — it can never publish. */
  accountIsActive: boolean;
  addedAt: string;
}

export interface AccountGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  isActive: boolean;
  autopilotEnabled: boolean;
  /** Weekdays as 0=Sunday..6=Saturday, comma separated. */
  slotWeekdays: string;
  slotHour: number;
  timezone: string;
  postsPerRun: number;
  topics: string[];
  serviceLine: string | null;
  audience: string | null;
  defaultFormat: string;
  slideCount: number | null;
  members: AccountGroupMember[];
  activeMemberCount: number;
  platforms: SocialPlatformKey[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountGroupPayload {
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  accountIds?: string[];
  /** Photographs this brand publishes with. Empty means the shared library. */
  assetIds?: string[];
  topics?: string[];
  serviceLine?: string;
  audience?: string;
  defaultFormat?: string;
  /** Frames per post. Null takes the house length for the format. */
  slideCount?: number | null;
  autopilotEnabled?: boolean;
  slotWeekdays?: string;
  slotHour?: number;
  timezone?: string;
  postsPerRun?: number;
}

export type UpdateAccountGroupPayload = Partial<CreateAccountGroupPayload> & {
  isActive?: boolean;
};

export interface GroupTarget {
  accountId: string;
  platform: string;
  pageId: string;
  pageName: string | null;
}

export interface AutomationPolicy {
  mode: AutomationMode;
  autoPublish: boolean;
  defaultGroupId: string | null;
  maxPostsPerDay: number;
  /** Runs counted against today's cap, so the budget is visible before clicking. */
  postsUsedToday: number;
  pausedUntil: string | null;
  lastRunAt: string | null;
  autopilotGroupCount: number;
  activeAccountCount: number;
}

export interface UpdateAutomationPolicyPayload {
  mode?: AutomationMode;
  autoPublish?: boolean;
  defaultGroupId?: string | null;
  maxPostsPerDay?: number;
  pausedUntil?: string | null;
}

export type AgentStepStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped";

export interface AgentRunStep {
  key: string;
  label: string;
  sequence: number;
  status: AgentStepStatus;
  detail: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
}

export interface AgentRun {
  id: string;
  groupId: string | null;
  groupName: string | null;
  agent: string;
  trigger: string;
  status: AgentRunStatus;
  topic: string | null;
  draftId: string | null;
  postIds: string[];
  accountsTargeted: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  steps: AgentRunStep[];
  /** A failed run that still holds enough working state to pick up where it stopped. */
  resumable: boolean;
  /** A running run the server can actually stop. */
  cancellable: boolean;
}

export interface AgentRunPage {
  items: AgentRun[];
  total: number;
  page: number;
  limit: number;
}

export interface AutopilotGroupOutcome {
  groupId: string;
  groupName: string;
  drafted: number;
  skipped: string | null;
  failed: string | null;
}

export interface RunRequestOutcome {
  accepted: boolean;
  alreadyRunning: boolean;
  activeRunId: string | null;
  reason: string | null;
  /** One click is not one post — a brand with postsPerRun: 3 produces three. */
  plannedPosts: number;
}

export interface AutopilotRunSummary {
  userId: string;
  mode: AutomationMode;
  drafted: number;
  groups: AutopilotGroupOutcome[];
}

export const RUN_STATUS_LABELS: Record<AgentRunStatus, string> = {
  running: "Running",
  succeeded: "Succeeded",
  failed: "Failed",
  skipped: "Skipped",
};

export const RUN_STATUS_VARIANT: Record<
  AgentRunStatus,
  "default" | "secondary" | "destructive"
> = {
  running: "default",
  succeeded: "secondary",
  failed: "destructive",
  skipped: "secondary",
};

export const RUN_STATUS_DOT: Record<AgentRunStatus, string> = {
  running: "bg-primary",
  succeeded: "bg-emerald",
  failed: "bg-destructive",
  skipped: "bg-dim-6",
};

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The accent a group is drawn with. Tokens only — a hex breaks dark mode. */
export const GROUP_COLORS = [
  "primary",
  "emerald",
  "terra",
  "gold",
  "forest",
  "indigo",
] as const;

export type GroupColor = (typeof GROUP_COLORS)[number];

export const GROUP_COLOR_TONE: Record<GroupColor, string> = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald/10 text-emerald",
  terra: "bg-terra/10 text-terra",
  gold: "bg-gold/10 text-gold",
  forest: "bg-forest/10 text-forest",
  indigo: "bg-indigo/10 text-indigo",
};

export function groupTone(color: string | null): string {
  return (
    GROUP_COLOR_TONE[(color ?? "primary") as GroupColor] ??
    GROUP_COLOR_TONE.primary
  );
}

/** "Tue & Fri at 09:00" — how a group's cadence reads in the UI. */
/** The zones offered when choosing a brand's posting hour. */
export function supportedTimeZones(): string[] {
  const supported = (
    Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
  ).supportedValuesOf;

  // Widely available, but not everywhere — fall back to the browser's own zone.
  const zones = supported ? supported("timeZone") : [];
  return zones.length ? zones : [browserTimeZone(), "UTC"];
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/** "GMT+2" and the like, so a zone name is not the only thing to go on. */
export function offsetLabel(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());

    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

export function describeCadence(group: {
  slotWeekdays: string;
  slotHour: number;
  timezone?: string;
}): string {
  const days = group.slotWeekdays
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
    .map((value) => WEEKDAY_LABELS[value]);

  // The hour resolves in the brand's own zone, so naming it removes the
  // ambiguity of a bare "09:00".
  const zone = group.timezone
    ? ` ${offsetLabel(group.timezone) || group.timezone}`
    : "";
  const when = `${String(group.slotHour).padStart(2, "0")}:00${zone}`;

  if (days.length === 0) return `at ${when}`;
  if (days.length === 7) return `Daily at ${when}`;
  if (days.length === 1) return `${days[0]} at ${when}`;
  return `${days.slice(0, -1).join(", ")} & ${days[days.length - 1]} at ${when}`;
}

export const STEP_STATUS_LABELS: Record<AgentStepStatus, string> = {
  pending: "Waiting",
  running: "Running",
  succeeded: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

/** Border + text tone per stage state. Tokens only, so both themes hold up. */
export const STEP_STATUS_TONE: Record<AgentStepStatus, string> = {
  pending: "border-border bg-inset text-dim-6",
  running: "border-primary/50 bg-primary/5 text-primary",
  succeeded: "border-emerald/35 bg-emerald/5 text-emerald",
  failed: "border-destructive/45 bg-destructive/5 text-destructive",
  skipped: "border-border bg-inset text-dim-6",
};

export const STEP_STATUS_RAIL: Record<AgentStepStatus, string> = {
  pending: "bg-border",
  running: "bg-primary",
  succeeded: "bg-emerald",
  failed: "bg-destructive",
  skipped: "bg-border",
};

export function isRunActive(run: Pick<AgentRun, "status">): boolean {
  return run.status === "running";
}

/**
 * Worth putting on screen: still going, or finished recently enough that the
 * person who set it off is probably still watching.
 */
export function isRunWorthWatching(
  run: Pick<AgentRun, "status" | "startedAt">,
  withinMs = 120_000,
): boolean {
  if (run.status === "running") return true;
  return Date.now() - new Date(run.startedAt).getTime() < withinMs;
}

/** How far through the pipeline a run is, as a percentage. */
export function runProgress(run: Pick<AgentRun, "steps">): number {
  if (run.steps.length === 0) return 0;
  const settled = run.steps.filter(
    (step) => step.status !== "pending" && step.status !== "running",
  ).length;
  return Math.round((settled / run.steps.length) * 100);
}

/** The stage a resume would pick up from — the first that did not finish. */
export function failedStep(
  run: Pick<AgentRun, "steps">,
): AgentRunStep | undefined {
  const ordered = [...run.steps].sort((a, b) => a.sequence - b.sequence);
  return (
    ordered.find((step) => step.status === "failed") ??
    ordered.find((step) => step.status === "pending")
  );
}

/** Stages that already succeeded and would be reused rather than redone. */
export function completedSteps(run: Pick<AgentRun, "steps">): AgentRunStep[] {
  return run.steps.filter((step) => step.status === "succeeded");
}

/**
 * How long a stage may run before the UI says something. The copy agent is the
 * slow one at roughly a minute, so this is "unusual", not "broken".
 */
export const SLOW_STEP_MS = 150_000;

export function runningStep(
  run: Pick<AgentRun, "steps">,
): AgentRunStep | undefined {
  return run.steps.find((step) => step.status === "running");
}

/**
 * A finished run needs a line, not a nine-stage breakdown. One that is going, or
 * that broke, is exactly when the detail earns its space.
 */
export function deservesDetail(run: Pick<AgentRun, "status">): boolean {
  return run.status === "running" || run.status === "failed";
}

/**
 * Frames a format can carry, mirroring SLIDE_COUNTS in the brand rules. The
 * house length is what a brand gets when it does not choose.
 */
export const FRAME_CHOICES: Record<string, number[]> = {
  post: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  story: [1, 2, 3],
  single: [1],
};

export const HOUSE_FRAMES: Record<string, number> = {
  post: 5,
  story: 3,
  single: 1,
};
