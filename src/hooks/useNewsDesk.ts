import { useToast } from "@/components/ui/use-toast";
import {
  describeNewsError,
  featureNewsArticle,
  getNewsArticle,
  getNewsDeskSummary,
  listNewsArticles,
  requeueNewsArticle,
  runNewsAgentStage,
  skipNewsArticle,
  type ListNewsParams,
} from "@/services/newsDeskService";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { NewsAgentStage } from "@/types/newsDesk";

export const newsDeskKeys = {
  all: ["news-desk"] as const,
  summary: () => ["news-desk", "summary"] as const,
  list: (params: ListNewsParams) => ["news-desk", "list", params] as const,
  detail: (id: string) => ["news-desk", "detail", id] as const,
};

const PIPELINE_POLL_MS = 60_000;
const RUNNING_POLL_MS = 5_000;

export function useNewsDeskSummary() {
  return useQuery({
    queryKey: newsDeskKeys.summary(),
    queryFn: getNewsDeskSummary,
    refetchInterval: (query) => {
      const agent = query.state.data?.agent;
      return agent?.ingest.running || agent?.enhance.running
        ? RUNNING_POLL_MS
        : PIPELINE_POLL_MS;
    },
  });
}

export function useNewsArticles(params: ListNewsParams = {}) {
  return useQuery({
    queryKey: newsDeskKeys.list(params),
    queryFn: () => listNewsArticles(params),
    placeholderData: keepPreviousData,
    refetchInterval: PIPELINE_POLL_MS,
  });
}

export function useNewsArticle(id: string | undefined) {
  return useQuery({
    queryKey: newsDeskKeys.detail(id ?? ""),
    queryFn: () => getNewsArticle(id as string),
    enabled: Boolean(id),
  });
}

function useNewsMutation<TArgs, TResult>(
  run: (args: TArgs) => Promise<TResult>,
  successMessage: string | ((args: TArgs) => string),
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: run,
    onSuccess: (_result, args) => {
      queryClient.invalidateQueries({ queryKey: newsDeskKeys.all });
      toast({
        title:
          typeof successMessage === "function"
            ? successMessage(args)
            : successMessage,
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeNewsError(error) });
    },
  });
}

export function useRunNewsAgentStage() {
  return useNewsMutation(
    (stage: NewsAgentStage) => runNewsAgentStage(stage),
    (stage) =>
      stage === "ingest"
        ? "Fetching the feeds now"
        : "Writing and publishing the queued articles now",
  );
}

export function useRequeueNewsArticle() {
  return useNewsMutation(
    (id: string) => requeueNewsArticle(id),
    "Queued — the next enhancement run picks it up within five minutes",
  );
}

export function useSkipNewsArticle() {
  return useNewsMutation(
    (id: string) => skipNewsArticle(id),
    "Skipped — it will not be enhanced",
  );
}

export function useFeatureNewsArticle() {
  return useNewsMutation(
    ({ id, featured }: { id: string; featured: boolean }) =>
      featureNewsArticle(id, featured),
    ({ featured }) =>
      featured ? "Featured on the website" : "Removed from featured",
  );
}
