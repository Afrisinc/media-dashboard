import { useToast } from "@/hooks/use-toast";
import { describeError } from "@/services/accountGroupService";
import {
  cancelAgentRun,
  getActiveAgentRun,
  getAgentRun,
  getAutomationPolicy,
  getAutomationSummary,
  listAgentRuns,
  resumeAgentRun,
  runAutomationNow,
  updateAutomationPolicy,
  type RunListParams,
} from "@/services/automationService";
import { accountGroupKeys } from "@/hooks/useAccountGroups";
import type {
  AutomationPolicy,
  UpdateAutomationPolicyPayload,
} from "@/types/accountGroup";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

export const automationKeys = {
  all: ["automation"] as const,
  policy: ["automation", "policy"] as const,
  runs: (params: RunListParams) => ["automation", "runs", params] as const,
  run: (id: string) => ["automation", "run", id] as const,
  active: ["automation", "active"] as const,
  summary: ["automation", "summary"] as const,
};

export function useAutomationPolicy() {
  return useQuery({
    queryKey: automationKeys.policy,
    queryFn: getAutomationPolicy,
    staleTime: 1000 * 30,
  });
}

/** A run in flight is worth watching closely; a quiet log is not. */
const LIVE_POLL_MS = 2_000;
const IDLE_POLL_MS = 30_000;
/** The active-run probe is a single indexed row, so it can afford to be eager. */
const ACTIVE_IDLE_POLL_MS = 10_000;
/**
 * A pass is accepted before its first row exists, so an immediate refetch can
 * still come back empty. Check again over the next few seconds rather than
 * leaving the page looking idle until the next heartbeat.
 */
const CATCH_UP_DELAYS_MS = [800, 2_000, 4_500];

export function watchForNewRun(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: automationKeys.all });
  for (const delay of CATCH_UP_DELAYS_MS) {
    window.setTimeout(
      () => queryClient.invalidateQueries({ queryKey: automationKeys.all }),
      delay,
    );
  }
}

export function useAgentRuns(params: RunListParams = {}) {
  return useQuery({
    queryKey: automationKeys.runs(params),
    queryFn: () => listAgentRuns(params),
    // The agents run on a server cron, so the log genuinely moves underneath the
    // user. While a run is going the pipeline is animating, so poll hard; once
    // everything has settled, drop back to a slow heartbeat.
    refetchInterval: (query) => {
      const page = query.state.data as AgentRunPage | undefined;
      const active = page?.items.some((run) => run.status === "running");
      return active ? LIVE_POLL_MS : IDLE_POLL_MS;
    },
  });
}

/** One run, polled hard while it is still going. */
export function useAgentRun(id: string | undefined) {
  return useQuery({
    queryKey: automationKeys.run(id ?? ""),
    queryFn: () => getAgentRun(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? LIVE_POLL_MS : false,
  });
}

/**
 * The run in flight, straight from the server. This is what makes the page
 * resumable: the work runs server-side, so coming back to it — or opening it in
 * another tab — picks the same run up wherever it got to.
 */
export function useActiveAgentRun() {
  return useQuery({
    queryKey: automationKeys.active,
    queryFn: getActiveAgentRun,
    // Poll fast while something is going, and keep a slow heartbeat when idle so
    // a run started from another tab, or by the cron, shows up on its own.
    refetchInterval: (query) =>
      query.state.data ? LIVE_POLL_MS : ACTIVE_IDLE_POLL_MS,
    refetchOnWindowFocus: true,
  });
}

/**
 * The run to put on screen right now: whatever is in flight, else whatever the
 * agents touched last.
 */
export function useLatestAgentRun() {
  const active = useActiveAgentRun();
  const recent = useAgentRuns({ limit: 1 });

  return {
    ...recent,
    run: active.data ?? recent.data?.items[0],
    isActive: Boolean(active.data),
  };
}

export function useAutomationSummary() {
  return useQuery({
    queryKey: automationKeys.summary,
    queryFn: getAutomationSummary,
    refetchInterval: 60_000,
  });
}

export function useUpdateAutomationPolicy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdateAutomationPolicyPayload) =>
      updateAutomationPolicy(payload),
    onSuccess: (policy: AutomationPolicy) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      queryClient.invalidateQueries({ queryKey: accountGroupKeys.all });
      toast({
        title:
          policy.mode === "autopilot"
            ? "Autopilot on — the agents will publish on their own"
            : "Back to manual — nothing publishes without you",
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

/**
 * Starts the agents. The server accepts the work and gets on with it, so this
 * resolves in milliseconds — what follows is watched through the run log, not
 * awaited here.
 */
export function useRunAutomationNow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: runAutomationNow,
    onSuccess: (outcome) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["post-drafts"] });

      if (outcome.accepted) {
        watchForNewRun(queryClient);
        toast({
          title: "Agents are running",
          description:
            "This keeps going if you leave — come back any time to see where it got to.",
        });
        return;
      }

      toast({
        variant: outcome.alreadyRunning ? "default" : "destructive",
        title: outcome.alreadyRunning
          ? "A run is already going"
          : "Nothing to run",
        description:
          outcome.reason ??
          "Switch the agents on for a brand that has topics and a live page.",
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

/**
 * Picks a failed run back up. Same shape as starting one: accepted immediately,
 * watched through the run log.
 */
export function useResumeAgentRun() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (runId: string) => resumeAgentRun(runId),
    onSuccess: (outcome) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.all });

      if (outcome.accepted) {
        watchForNewRun(queryClient);
        toast({
          title: "Picking up where it stopped",
          description: "The stages that already passed are reused, not redone.",
        });
        return;
      }

      toast({
        title: "Could not resume",
        description: outcome.reason ?? "Try starting a fresh run instead.",
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

/** Stops a run that is still going, freeing the workspace's one run slot. */
export function useCancelAgentRun() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (runId: string) => cancelAgentRun(runId),
    onSuccess: (outcome) => {
      queryClient.invalidateQueries({ queryKey: automationKeys.all });
      toast({
        title: "Run stopped",
        description: outcome.cancelled
          ? "You can start another one now."
          : outcome.reason,
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}
