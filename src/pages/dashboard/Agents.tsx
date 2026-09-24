import { useState } from "react";
import { AgentControlCard } from "@/components/dashboard/AgentControlCard";
import { MediaLightbox } from "@/components/dashboard/MediaLightbox";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutopilot } from "@/contexts/AutopilotContext";
import {
  useAgents,
  useAutomationSummary,
  useUpdateAgent,
} from "@/hooks/useAutomation";
import { usePostDrafts } from "@/hooks/usePostAgent";
import { useNewsArticles, useNewsDeskSummary } from "@/hooks/useNewsDesk";
import { useStories } from "@/hooks/useStoryAgent";
import {
  AGENT_ICONS,
  AGENT_NAMES,
  agentStatusPill,
  describeLastRun,
} from "@/lib/agents";
import { describeCron } from "@/lib/cron";
import { formatDateShort } from "@/lib/dateFormat";
import { newsArticleTitle } from "@/lib/newsDesk";
import { compactNumber } from "@/lib/numberFormat";
import {
  AGENT_SCOPE_LABELS,
  type AgentKey,
  type AgentStatus,
} from "@/types/agents";
import {
  NEWS_STATUS_LABELS,
  NEWS_STATUS_VARIANT,
  type NewsArticle,
} from "@/types/newsDesk";
import {
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type PostDraft,
  type PostDraftStatus,
} from "@/types/postAgent";
import { STORY_STATUS_VARIANT, type Story } from "@/types/story";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Hand,
  History,
  Inbox,
  Rss,
  ServerCrash,
} from "lucide-react";
import { Link } from "react-router-dom";

const AGENT_KEYS: AgentKey[] = [
  "post",
  "story",
  "news",
  "newsletter",
  "analytics",
];

const RECENT_LIMIT = 8;

function countBy(drafts: PostDraft[], status: PostDraftStatus): number {
  return drafts.filter((draft) => draft.status === status).length;
}

function DraftRow({
  draft,
  onOpen,
}: {
  draft: PostDraft;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border/50 py-3 last:border-0">
      {draft.slideUrls.length > 0 ? (
        <button
          type="button"
          onClick={() => onOpen(draft.id)}
          aria-label={`Open the frames for ${draft.topic}`}
          className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted transition-opacity hover:opacity-80"
        >
          <img
            src={draft.slideUrls[0]}
            alt=""
            className="h-full w-full object-cover"
          />
        </button>
      ) : (
        <span className="h-12 w-12 flex-shrink-0 rounded-md border border-border bg-inset" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{draft.topic}</p>
        <p className="text-xs text-muted-foreground">
          {FORMAT_LABELS[draft.format]} · {draft.slideUrls.length}{" "}
          {draft.slideUrls.length === 1 ? "frame" : "frames"} ·{" "}
          {formatDateShort(draft.createdAt)}
        </p>
      </div>

      <Badge variant={STATUS_VARIANT[draft.status]}>
        {STATUS_LABELS[draft.status]}
      </Badge>
    </div>
  );
}

function StoryRow({ story }: { story: Story }) {
  return (
    <Link
      to={`/stories/${story.id}`}
      className="flex items-center gap-4 border-b border-border/50 py-3 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-border bg-inset">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{story.title}</p>
        <p className="text-xs text-muted-foreground">
          {story.genre ?? "Story"} · {formatDateShort(story.updatedAt)}
        </p>
      </div>

      <Badge variant={STORY_STATUS_VARIANT[story.status]}>{story.status}</Badge>
    </Link>
  );
}

function NewsRow({ article }: { article: NewsArticle }) {
  return (
    <Link
      to="/news"
      className="flex items-center gap-4 border-b border-border/50 py-3 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-border bg-inset">
        <Rss className="h-4 w-4 text-muted-foreground" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {newsArticleTitle(article)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[article.creator, formatDateShort(article.created_at)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <Badge
        variant={
          article.stuck ? "destructive" : NEWS_STATUS_VARIANT[article.status]
        }
      >
        {article.stuck ? "Stuck" : NEWS_STATUS_LABELS[article.status]}
      </Badge>
    </Link>
  );
}

const RECENT_EMPTY = "text-sm text-muted-foreground py-2";

function AgentsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {[0, 1, 2, 3].map((key) => (
        <Skeleton key={key} className="h-72 w-full rounded-xl" />
      ))}
    </div>
  );
}

function ModeToggle() {
  const { mode, setAutopilot, isSaving, isLoading } = useAutopilot();

  if (isLoading) {
    return <Skeleton className="h-10 w-64" />;
  }

  return (
    <SegmentedControl
      options={[
        { label: "I drive", value: "manual", icon: Hand },
        { label: "Agents drive", value: "autopilot", icon: Bot },
      ]}
      value={mode}
      onChange={(next) => {
        if (!isSaving && next !== mode) setAutopilot(next === "autopilot");
      }}
    />
  );
}

const DashboardAgents = () => {
  const { data, isLoading: isLoadingDrafts } = usePostDrafts({ limit: 50 });
  const { data: storyData, isLoading: isLoadingStories } = useStories({
    limit: 50,
  });
  const newsSummary = useNewsDeskSummary();
  const newsArticles = useNewsArticles({ page: 1, limit: RECENT_LIMIT });
  const agentsQuery = useAgents();
  const updateAgent = useUpdateAgent();
  const { data: todaySummary } = useAutomationSummary();
  const { autopilot } = useAutopilot();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  const drafts = data?.items ?? [];
  const stories = storyData?.items ?? [];
  const agents = agentsQuery.data ?? [];
  const agentByKey = (key: AgentKey) =>
    agents.find((agent) => agent.key === key);

  const inReview = countBy(drafts, "awaiting_approval");
  const scheduled = countBy(drafts, "scheduled");
  const needsFix = countBy(drafts, "failed") + countBy(drafts, "rendered");
  const activeStories = stories.filter(
    (story) => story.status === "ACTIVE",
  ).length;
  const episodesToReview = stories.reduce(
    (total, story) => total + story.episodeCount - story.publishedEpisodeCount,
    0,
  );
  const newsCounts = newsSummary.data?.byStatus;
  const newsNeedsFix =
    (newsCounts?.failed ?? 0) + (newsSummary.data?.stuck ?? 0);

  const runningCount = agents.filter((agent) => agent.active).length;
  const runsToday = agents.reduce((total, agent) => total + agent.runsToday, 0);
  const failedToday = todaySummary?.failed ?? 0;

  const headline: StripStat[] = [
    {
      label: "Agents on",
      value: `${runningCount}/${agents.length || AGENT_KEYS.length}`,
      icon: Bot,
      tone: runningCount > 0 ? "success" : "default",
      hint: autopilot ? "The workspace is on Agents drive" : "You are driving",
    },
    {
      label: "Waiting on you",
      value: String(inReview),
      icon: Inbox,
      tone: inReview > 0 ? "attention" : "default",
      hint: inReview > 0 ? "Posts ready for review" : "Nothing to review",
    },
    {
      label: "Runs today",
      value: String(runsToday),
      icon: History,
      hint: "Across every agent",
    },
    {
      label: "Failed today",
      value: String(failedToday),
      icon: AlertTriangle,
      tone: failedToday > 0 ? "danger" : "default",
      hint: failedToday > 0 ? "Open the run log to see why" : "All clear",
    },
  ];

  const switchFor = (key: AgentKey) => {
    const agent = agentByKey(key);
    return agent
      ? {
          checked: agent.enabled,
          disabled: !agent.allowedByServer || updateAgent.isPending,
          onChange: (enabled: boolean) => updateAgent.mutate({ key, enabled }),
        }
      : undefined;
  };

  const tagsFor = (agent: AgentStatus | undefined, extra: string[] = []) =>
    agent
      ? [
          AGENT_SCOPE_LABELS[agent.scope],
          ...(agent.requiresAutopilot ? ["Needs Agents drive"] : []),
          ...extra,
        ]
      : extra;

  const scheduleFor = (agent: AgentStatus | undefined) =>
    agent
      ? agent.schedules
          .map((item) => `${item.label} ${describeCron(item.cron)}`)
          .join(" · ")
      : "";

  const cardFor = (key: AgentKey) => {
    const agent = agentByKey(key);
    return {
      icon: AGENT_ICONS[key],
      name: agent?.name ?? AGENT_NAMES[key],
      description: agent?.description ?? "",
      tags: tagsFor(agent),
      status: agent
        ? agentStatusPill(agent)
        : { label: "Loading", tone: "off" as const },
      switchControl: switchFor(key),
      schedule: scheduleFor(agent),
      lastRun: describeLastRun(agent?.lastRun ?? null),
      lastRunFailed: agent?.lastRun?.status === "failed",
      runsLink: `/automation?agent=${key}`,
    };
  };

  const openFrames = (id: string) => {
    setSelectedDraftId(id);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title="AI Agents"
        subtitle="Switch each agent on or off, see what it is doing, and jump into its work."
        action={<ModeToggle />}
      />

      <StatStrip
        variant="tiles"
        stats={headline}
        loading={agentsQuery.isLoading}
      />

      {agentsQuery.isError && (
        <Card>
          <EmptyState
            icon={ServerCrash}
            title="Could not reach content-service"
            description="The agents run inside content-service. Check that it is up, then try again."
            action={
              <Button variant="outline" onClick={() => agentsQuery.refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      )}

      {agentsQuery.isLoading && <AgentsSkeleton />}

      {agentsQuery.data && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AgentControlCard
            {...cardFor("post")}
            metrics={[
              {
                label: "In review",
                value: String(inReview),
                tone: inReview > 0 ? "attention" : "default",
              },
              { label: "Scheduled", value: String(scheduled) },
              {
                label: "Needs a fix",
                value: String(needsFix),
                tone: needsFix > 0 ? "danger" : "default",
              },
              {
                label: "Runs today",
                value: String(agentByKey("post")?.runsToday ?? 0),
              },
            ]}
            primaryLink={{ label: "Post Studio", to: "/studio" }}
            recentWork={
              isLoadingDrafts ? (
                <Skeleton className="h-24 w-full" />
              ) : drafts.length === 0 ? (
                <p className={RECENT_EMPTY}>
                  Nothing drafted yet. Brief the agent from Post Studio.
                </p>
              ) : (
                drafts
                  .slice(0, RECENT_LIMIT)
                  .map((draft) => (
                    <DraftRow
                      key={draft.id}
                      draft={draft}
                      onOpen={openFrames}
                    />
                  ))
              )
            }
          />

          <AgentControlCard
            {...cardFor("news")}
            metrics={[
              {
                label: "Published",
                value: String(newsCounts?.published ?? 0),
                tone: "success",
              },
              { label: "Queued", value: String(newsCounts?.draft ?? 0) },
              {
                label: "Needs a fix",
                value: String(newsNeedsFix),
                tone: newsNeedsFix > 0 ? "danger" : "default",
              },
              {
                label: "Views",
                value: compactNumber(newsSummary.data?.views ?? 0),
              },
            ]}
            primaryLink={{ label: "News Desk", to: "/news" }}
            recentWork={
              newsArticles.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (newsArticles.data?.items.length ?? 0) === 0 ? (
                <p className={RECENT_EMPTY}>No articles fetched yet.</p>
              ) : (
                newsArticles.data?.items.map((article) => (
                  <NewsRow key={article.id} article={article} />
                ))
              )
            }
          />

          <AgentControlCard
            {...cardFor("story")}
            metrics={[
              { label: "Stories", value: String(stories.length) },
              {
                label: "Active",
                value: String(activeStories),
                tone: activeStories > 0 ? "success" : "default",
              },
              {
                label: "To review",
                value: String(episodesToReview),
                tone: episodesToReview > 0 ? "attention" : "default",
              },
              {
                label: "Runs today",
                value: String(agentByKey("story")?.runsToday ?? 0),
              },
            ]}
            primaryLink={{ label: "Story Studio", to: "/stories" }}
            recentWork={
              isLoadingStories ? (
                <Skeleton className="h-24 w-full" />
              ) : stories.length === 0 ? (
                <p className={RECENT_EMPTY}>
                  No stories yet. Start one from Story Studio.
                </p>
              ) : (
                stories
                  .slice(0, RECENT_LIMIT)
                  .map((story) => <StoryRow key={story.id} story={story} />)
              )
            }
          />

          <AgentControlCard
            {...cardFor("newsletter")}
            metrics={[
              {
                label: "Runs today",
                value: String(agentByKey("newsletter")?.runsToday ?? 0),
              },
            ]}
          />

          <AgentControlCard
            {...cardFor("analytics")}
            metrics={[
              {
                label: "Runs today",
                value: String(agentByKey("analytics")?.runsToday ?? 0),
              },
            ]}
            primaryLink={{ label: "Analytics", to: "/analytics" }}
          />
        </div>
      )}

      {selectedDraftId && (
        <MediaLightbox
          images={drafts.find((d) => d.id === selectedDraftId)?.slideUrls ?? []}
          index={0}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onIndexChange={() => {}}
        />
      )}
    </div>
  );
};

export default DashboardAgents;
