import { useState } from "react";
import {
  BookOpen,
  FileText,
  Images,
  Mic,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  MediaCard,
  MediaCardOverlayChip,
  MediaCardSkeleton,
} from "@/components/ui/media-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { MEDIA_FORMATS } from "@/config/mediaFormats";
import { formatDateShort } from "@/lib/dateFormat";
import type { MediaKind, MediaLibraryItem } from "@/lib/mediaLibrary";

const LIBRARY_TABS = [
  { label: "All", value: "all" },
  { label: "Posts", value: "post" },
  { label: "Articles", value: "article" },
  { label: "Stories", value: "story" },
  { label: "Videos", value: "video" },
  { label: "Podcasts", value: "podcast" },
] as const;

type LibraryTab = (typeof LIBRARY_TABS)[number]["value"];

const PAGE_SIZE = 15;

const LIBRARY_GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5";

const KIND_ICON: Record<MediaKind, LucideIcon> = {
  post: Images,
  article: FileText,
  story: BookOpen,
  video: Video,
  podcast: Mic,
};

const KIND_LABEL: Record<MediaKind, string> = {
  post: "Post",
  article: "Article",
  story: "Story",
  video: "Video",
  podcast: "Podcast",
};

function LibraryCard({
  item,
  onOpen,
}: Readonly<{ item: MediaLibraryItem; onOpen: () => void }>) {
  const Icon = KIND_ICON[item.kind];

  return (
    <MediaCard
      aspect="square"
      mediaLabel={`Open ${item.title}`}
      onMediaClick={onOpen}
      onTitleClick={onOpen}
      media={
        item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-inset">
            <Icon className="h-8 w-8 text-muted-foreground/60" aria-hidden />
          </span>
        )
      }
      topLeft={
        <MediaCardOverlayChip className="gap-1 px-2 py-0.5 text-[11px] font-medium">
          <Icon className="h-3 w-3" aria-hidden />
          {KIND_LABEL[item.kind]}
        </MediaCardOverlayChip>
      }
      topRight={
        <Badge variant={item.statusVariant} className="shadow-sm">
          {item.statusLabel}
        </Badge>
      }
      title={item.title}
      caption={
        <span className="flex items-center justify-between gap-2">
          <span className="truncate">{item.meta}</span>
          <span className="flex-shrink-0 tabular-nums">
            {formatDateShort(item.date)}
          </span>
        </span>
      }
    />
  );
}

interface MediaLibrarySectionProps {
  items: MediaLibraryItem[];
  loading: boolean;
  failed: boolean;
  retrying: boolean;
  onRetry: () => void;
  onOpen: (item: MediaLibraryItem) => void;
}

function LibraryBody({
  tab,
  items,
  loading,
  failed,
  retrying,
  onRetry,
  onOpen,
}: Readonly<MediaLibrarySectionProps & { tab: LibraryTab }>) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const comingSoon = MEDIA_FORMATS.find(
    (format) => format.kind === tab && format.href === undefined,
  );
  if (comingSoon) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-inset/40">
        <EmptyState
          icon={comingSoon.icon}
          title={`${comingSoon.title} are coming soon`}
          description={`${comingSoon.description} They will appear here alongside everything else the agents make.`}
        />
      </div>
    );
  }

  if (failed) {
    return (
      <ErrorState
        title="Could not load the library"
        description="content-service is not answering. Check that it is running."
        onRetry={onRetry}
        retrying={retrying}
      />
    );
  }

  if (loading) {
    return (
      <div className={LIBRARY_GRID}>
        {Array.from({ length: 10 }, (_, index) => (
          <MediaCardSkeleton key={index} aspect="square" />
        ))}
      </div>
    );
  }

  const filtered =
    tab === "all" ? items : items.filter((item) => item.kind === tab);

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border">
        <EmptyState
          icon={tab === "all" ? Sparkles : KIND_ICON[tab]}
          title="Nothing finished here yet"
          description="Brief the agents with ⌘K, or open a studio to start the first piece."
        />
      </div>
    );
  }

  const shown = filtered.slice(0, visible);

  return (
    <>
      <div className={LIBRARY_GRID}>
        {shown.map((item) => (
          <LibraryCard key={item.id} item={item} onOpen={() => onOpen(item)} />
        ))}
      </div>
      {filtered.length > shown.length && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisible((count) => count + PAGE_SIZE)}
          >
            Show more ({filtered.length - shown.length} left)
          </Button>
        </div>
      )}
    </>
  );
}

export function MediaLibrarySection(props: Readonly<MediaLibrarySectionProps>) {
  const [tab, setTab] = useState<LibraryTab>("all");

  return (
    <section className="space-y-4" aria-labelledby="media-library-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="media-library-title" className="text-sm font-semibold">
            Library
          </h2>
          <p className="text-xs text-muted-foreground">
            Finished work from every studio, newest first
          </p>
        </div>
        <div className="max-w-full overflow-x-auto">
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={LIBRARY_TABS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
          />
        </div>
      </div>

      <LibraryBody key={tab} tab={tab} {...props} />
    </section>
  );
}
