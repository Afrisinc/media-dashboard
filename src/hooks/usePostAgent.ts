import { useToast } from "@/components/ui/use-toast";
import {
  approvePostDraft,
  createPostDraft,
  describeError,
  getPostDraft,
  listPostDrafts,
  rejectPostDraft,
  rerenderPostDraft,
  schedulePostDraft,
  type ListParams,
} from "@/services/postAgentService";
import type { PostBrief, PostDraft, SchedulePayload } from "@/types/postAgent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const postDraftKeys = {
  all: ["post-drafts"] as const,
  list: (params: ListParams) => ["post-drafts", "list", params] as const,
  detail: (id: string) => ["post-drafts", "detail", id] as const,
};

export function usePostDrafts(params: ListParams = {}) {
  return useQuery({
    queryKey: postDraftKeys.list(params),
    queryFn: () => listPostDrafts(params),
    // Generation takes a minute or so; a slow poll keeps the queue honest
    // without hammering the agent.
    refetchInterval: 30_000,
  });
}

export function usePostDraft(id: string | undefined) {
  return useQuery({
    queryKey: postDraftKeys.detail(id ?? ""),
    queryFn: () => getPostDraft(id as string),
    enabled: Boolean(id),
  });
}

function useDraftMutation<TArgs>(
  run: (args: TArgs) => Promise<PostDraft>,
  successMessage: (draft: PostDraft) => string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: run,
    onSuccess: (draft) => {
      queryClient.invalidateQueries({ queryKey: postDraftKeys.all });
      toast({ title: successMessage(draft) });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

export function useCreatePostDraft() {
  return useDraftMutation(
    (brief: PostBrief) => createPostDraft(brief),
    (draft) =>
      draft.auditPassed
        ? "Drafted and queued for review"
        : "Drafted, but the craft audit found something",
  );
}

export function useApprovePostDraft() {
  return useDraftMutation(
    (id: string) => approvePostDraft(id),
    () => "Approved and released to the schedule",
  );
}

export function useRejectPostDraft() {
  return useDraftMutation(
    ({ id, reason }: { id: string; reason: string }) =>
      rejectPostDraft(id, reason),
    () => "Rejected. The queued posts were cancelled.",
  );
}

export function useRerenderPostDraft() {
  return useDraftMutation(
    (id: string) => rerenderPostDraft(id),
    () => "Re-rendered from the stored spec",
  );
}

export function useSchedulePostDraft() {
  return useDraftMutation(
    ({ id, payload }: { id: string; payload?: SchedulePayload }) =>
      schedulePostDraft(id, payload ?? {}),
    () => "Moved to a new slot",
  );
}
