import { useState } from "react";
import { FileText, Video, Mic, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { IconBox } from "@/components/ui/icon-box";
import { LabeledProgress } from "@/components/ui/labeled-progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ListRow } from "@/components/ui/list-row";
import {
  MediaPreviewDialog,
  type PreviewItem,
} from "@/components/dashboard/MediaPreviewDialog";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import { useAutopilot } from "@/contexts/AutopilotContext";

type MediaKind = "article" | "video" | "podcast" | "story";

const kindIcon: Record<MediaKind, typeof FileText> = {
  article: FileText,
  video: Video,
  podcast: Mic,
  story: ImageIcon,
};

const queue: {
  title: string;
  kind: MediaKind;
  meta: string;
  stage: string;
  progress: number;
}[] = [
  {
    title: "How African startups win with AI marketing",
    kind: "video",
    meta: "Video · 9:16 · TikTok, Reels, Shorts",
    stage: "Rendering visuals",
    progress: 61,
  },
  {
    title: "Lagos fintech weekly roundup — Issue 34",
    kind: "article",
    meta: "Blog article · 2,100 words · Website, LinkedIn",
    stage: "SEO optimization",
    progress: 78,
  },
  {
    title: "Afrisinc Radio Ep. 12 — Automation for creators",
    kind: "podcast",
    meta: "Podcast · 18 min · voice: Amara (ElevenLabs)",
    stage: "Mixing audio",
    progress: 44,
  },
  {
    title: "5-part story series: Meet your AI creative team",
    kind: "story",
    meta: "Stories · 1080×1920 · Website, IG, WhatsApp",
    stage: "Sequencing series",
    progress: 92,
  },
];

const library: {
  title: string;
  kind: MediaKind;
  platforms: string;
  metric: string;
  status: "Published" | "Scheduled";
}[] = [
  {
    title: "Why 2026 is the year of autonomous marketing",
    kind: "video",
    platforms: "TikTok +2",
    metric: "128K views",
    status: "Published",
  },
  {
    title: "AI marketing in Africa: the 2026 playbook",
    kind: "article",
    platforms: "Website +2",
    metric: "4.2K reads",
    status: "Published",
  },
  {
    title: "Behind the automation: a day with zero humans",
    kind: "story",
    platforms: "Website +2",
    metric: "Tue 09:00",
    status: "Scheduled",
  },
  {
    title: "Ep. 11 — Scaling content without a team",
    kind: "podcast",
    platforms: "YouTube",
    metric: "9.8K plays",
    status: "Published",
  },
  {
    title: "60-second explainer: your AI creative director",
    kind: "video",
    platforms: "Shorts, TikTok",
    metric: "Wed 14:00",
    status: "Scheduled",
  },
  {
    title: "Case study: 3× engagement, zero manual posts",
    kind: "article",
    platforms: "Website, LinkedIn",
    metric: "2.9K reads",
    status: "Published",
  },
  {
    title: "Poll series: what should our AI make next?",
    kind: "story",
    platforms: "Website +2",
    metric: "31K taps",
    status: "Published",
  },
  {
    title: "Product tour: the Afrisinc automation engine",
    kind: "video",
    platforms: "YouTube +2",
    metric: "54K views",
    status: "Published",
  },
];

const tabs = ["All", "Articles", "Videos", "Podcasts", "Stories"] as const;

const DashboardMedia = () => {
  const { autopilot, setAutopilot } = useAutopilot();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const { setOpen: setCommandOpen } = useCommandPalette();

  const filteredLibrary =
    tab === "All"
      ? library
      : library.filter((item) => `${item.kind}s` === tab.toLowerCase());

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="line-accent">Media Studio</p>
          <h1 className="heading-section font-display italic mt-2">
            Your media, on autopilot
          </h1>
          <p className="text-secondary mt-1">
            {autopilot
              ? "Fully automated — content is generated, scheduled and published with no human input."
              : "Human-in-loop — AI generates everything; items pause for your approval before publishing."}
          </p>
        </div>
        <SegmentedControl
          value={autopilot ? "auto" : "human"}
          onChange={(value) => setAutopilot(value === "auto")}
          options={[
            { label: "Autopilot", value: "auto" },
            { label: "Human-in-loop", value: "human" },
          ]}
        />
      </div>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="flex w-full items-center gap-4 rounded-xl border border-border-3 bg-card p-4 text-left transition-colors hover:border-primary/55 hover:bg-card-hi"
      >
        <IconBox icon={FileText} tone="primary" />
        <span className="flex-1 text-sm text-muted-foreground">
          Tell your AI team what to make — “3 Reels on mobile money, post
          Thursday”
        </span>
        <span className="rounded-md border border-border-3 bg-inset-3 px-2 py-1 text-[10.5px] font-bold text-dim-4">
          ⌘K
        </span>
      </button>

      <StatGrid columns={4}>
        <StatCard
          label="Media this week"
          value="86"
          delta={{ value: "+24% vs last week", direction: "up" }}
        />
        <StatCard
          label="Auto-published"
          value={autopilot ? "79" : "58"}
          delta={{
            value: autopilot ? "92% straight-through" : "autopilot paused",
            direction: autopilot ? "up" : "down",
          }}
        />
        <StatCard
          label="Awaiting review"
          value={autopilot ? "0" : "7"}
          subtitle={autopilot ? "no human needed" : "7 items waiting"}
        />
        <StatCard
          label="Avg. engagement"
          value="6.4%"
          delta={{ value: "+1.1 pts vs last week", direction: "up" }}
        />
      </StatGrid>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold">In production now</span>
          </div>
          <span className="text-xs text-dim-4">
            {queue.length} items ·{" "}
            {autopilot
              ? "no human input required"
              : "pausing for your approval"}
          </span>
        </div>
        <div className="divide-y divide-border/40">
          {queue.map((item) => {
            const Icon = kindIcon[item.kind];
            return (
              <ListRow key={item.title} className="px-5 py-3.5">
                <IconBox icon={Icon} tone="primary" size="sm" />
                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="truncate text-xs text-dim-4">{item.meta}</p>
                </div>
                <div className="w-full flex-1 basis-40 sm:w-64 sm:flex-none">
                  <LabeledProgress
                    label={item.stage}
                    valueLabel={`${item.progress}%`}
                    value={item.progress}
                  />
                </div>
                <Badge
                  className="justify-center whitespace-nowrap sm:w-28"
                  variant={autopilot ? "default" : "secondary"}
                >
                  {autopilot ? "Auto-publish" : "Needs review"}
                </Badge>
              </ListRow>
            );
          })}
        </div>
      </Card>

      <div>
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={tabs.map((t) => ({ label: t, value: t }))}
          />
          <span className="text-xs text-dim-4">
            {filteredLibrary.length} assets · all generated &amp; published
            automatically
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredLibrary.map((item) => {
            const Icon = kindIcon[item.kind];
            return (
              <Card
                key={item.title}
                onClick={() =>
                  setPreview({
                    kind: item.kind,
                    title: item.title,
                    status: item.status,
                    channels: item.platforms.replace(" +2", "").split(", "),
                    metric: item.metric,
                  })
                }
                className="cursor-pointer overflow-hidden transition-transform hover:-translate-y-1"
              >
                <div className="relative flex h-32 items-center justify-center bg-inset-2">
                  <Icon className="h-6 w-6 text-foreground/85" />
                  <Badge
                    variant={
                      item.status === "Published" ? "default" : "secondary"
                    }
                    className="absolute right-2 top-2"
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="p-3.5">
                  <p className="min-h-[35px] text-sm font-semibold leading-snug">
                    {item.title}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-dim-4">
                    <span>{item.platforms}</span>
                    <span>{item.metric}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <MediaPreviewDialog item={preview} onClose={() => setPreview(null)} />
    </div>
  );
};

export default DashboardMedia;
