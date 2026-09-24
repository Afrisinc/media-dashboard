import { useNavigate } from "react-router-dom";
import { CalendarClock, Eye, FileText, Inbox, Sparkles } from "lucide-react";
import { MediaFormatCards } from "@/components/dashboard/MediaFormatCards";
import { MediaLibrarySection } from "@/components/dashboard/MediaLibrarySection";
import {
  ProductionQueue,
  type ProductionItem,
} from "@/components/dashboard/ProductionQueue";
import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import { IconBox } from "@/components/ui/icon-box";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAutopilot } from "@/contexts/AutopilotContext";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import { useNewsArticles, useNewsDeskSummary } from "@/hooks/useNewsDesk";
import { usePostDrafts } from "@/hooks/usePostAgent";
import { useStories } from "@/hooks/useStoryAgent";
import {
  articleToMedia,
  isFinishedArticle,
  isFinishedPost,
  isStartedStory,
  newestFirst,
  postToMedia,
  storyToMedia,
} from "@/lib/mediaLibrary";
import { newsArticleTitle } from "@/lib/newsDesk";
import { compactNumber } from "@/lib/numberFormat";
import { isReviewable } from "@/types/postAgent";

const DashboardMedia = () => {
  const navigate = useNavigate();
  const { autopilot, setAutopilot, isSaving } = useAutopilot();
  const { setOpen: setCommandOpen } = useCommandPalette();

  const drafts = usePostDrafts({ limit: 50 });
  const articles = useNewsArticles({ page: 1, limit: 30 });
  const newsSummary = useNewsDeskSummary();
  const stories = useStories({ limit: 50 });

  const draftItems = drafts.data?.items ?? [];
  const articleItems = articles.data?.items ?? [];
  const storyItems = stories.data?.items ?? [];

  const waiting = draftItems.filter(isReviewable).length;
  const scheduled = draftItems.filter(
    (draft) => draft.status === "scheduled",
  ).length;
  const published = newsSummary.data?.byStatus.published ?? 0;
  const storyReads = storyItems.reduce(
    (total, story) => total + story.totalReads,
    0,
  );
  const activeStories = storyItems.filter(
    (story) => story.status === "ACTIVE",
  ).length;

  const stats: StripStat[] = [
    {
      label: "Waiting on you",
      value: String(waiting),
      icon: Inbox,
      tone: waiting > 0 ? "attention" : "default",
      hint: waiting > 0 ? "Posts ready for review" : "Nothing to review",
      onSelect: () => navigate("/studio"),
    },
    {
      label: "Scheduled",
      value: String(scheduled),
      icon: CalendarClock,
      hint: "Posts queued to publish",
      onSelect: () => navigate("/studio"),
    },
    {
      label: "Articles live",
      value: compactNumber(published),
      icon: FileText,
      tone: published > 0 ? "success" : "default",
      hint: `${compactNumber(newsSummary.data?.views ?? 0)} views on the website`,
      onSelect: () => navigate("/news"),
    },
    {
      label: "Story reads",
      value: compactNumber(storyReads),
      icon: Eye,
      hint: `${activeStories} ${activeStories === 1 ? "story" : "stories"} being written`,
      onSelect: () => navigate("/stories"),
    },
  ];

  const production: ProductionItem[] = [
    ...draftItems
      .filter((draft) => draft.status === "drafting")
      .map((draft) => ({
        id: `post-${draft.id}`,
        kind: "post" as const,
        title: draft.topic,
        stage: "Drafting",
        meta: "Social post · Post Studio",
        href: "/studio",
      })),
    ...articleItems
      .filter((article) => article.status === "processing" && !article.stuck)
      .map((article) => ({
        id: `article-${article.id}`,
        kind: "article" as const,
        title: newsArticleTitle(article),
        stage: "Writing & illustrating",
        meta: `Article · ${article.creator ?? "News Desk"}`,
        href: "/news",
      })),
  ];

  const library = newestFirst([
    ...draftItems.filter(isFinishedPost).map(postToMedia),
    ...articleItems.filter(isFinishedArticle).map(articleToMedia),
    ...storyItems.filter(isStartedStory).map(storyToMedia),
  ]);
  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        eyebrow="Media Studio"
        title="Your media, on autopilot"
        titleClassName="font-display italic"
        subtitle={
          autopilot
            ? "Agents drive: posts, articles and stories are made and published without waiting for you."
            : "You drive: the agents make everything, and each piece waits for your approval."
        }
        action={
          <SegmentedControl
            value={autopilot ? "auto" : "human"}
            onChange={(value) => {
              if (!isSaving) setAutopilot(value === "auto");
            }}
            options={[
              { label: "I drive", value: "human" },
              { label: "Agents drive", value: "auto" },
            ]}
          />
        }
      />

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-card-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IconBox icon={Sparkles} tone="primary" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">
            Tell your AI team what to make
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            “A carousel on mobile money for Thursday” or “the next episode of my
            story”
          </span>
        </span>
        <kbd className="hidden rounded-md border border-border bg-inset px-2 py-1 text-[11px] font-semibold text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <StatStrip
        variant="tiles"
        stats={stats}
        loading={drafts.isLoading || newsSummary.isLoading || stories.isLoading}
      />

      <MediaFormatCards
        loading={drafts.isLoading || articles.isLoading || stories.isLoading}
        counts={{
          post: drafts.data?.total ?? draftItems.length,
          article: newsSummary.data?.total ?? articleItems.length,
          story: stories.data?.total ?? storyItems.length,
        }}
      />

      <ProductionQueue
        items={production}
        loading={drafts.isLoading || articles.isLoading}
        autopilot={autopilot}
      />

      <MediaLibrarySection
        items={library}
        loading={drafts.isLoading || articles.isLoading || stories.isLoading}
        failed={drafts.isError && articles.isError && stories.isError}
        retrying={drafts.isFetching || articles.isFetching}
        onRetry={() => {
          drafts.refetch();
          articles.refetch();
          stories.refetch();
        }}
        onOpen={(item) => navigate(item.href)}
      />
    </div>
  );
};

export default DashboardMedia;
