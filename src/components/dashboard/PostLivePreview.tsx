import { cn } from "@/lib/utils";
import { MediaFrame } from "./MediaFrame";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Film,
  ImageIcon,
  Link2,
  Newspaper,
  Play,
  Sparkles,
} from "lucide-react";

interface PostLivePreviewProps {
  platform?: string;
  format: "feed" | "story" | "reel";
  accountName?: string;
  accountAvatar?: string;
  message?: string;
  link?: string;
  tags?: string;
  images: string[];
  currentIndex?: number;
  videoUrl?: string;
  scheduleTime?: string;
  aiGenerated?: boolean;
  onExpandImage?: () => void;
  onIndexChange?: (index: number) => void;
}

const FEED_ASPECT: Record<string, string> = {
  instagram: "aspect-[4/5]",
  facebook: "aspect-[1.91/1]",
  twitter: "aspect-video",
  linkedin: "aspect-[1.91/1]",
  tiktok: "aspect-[9/16]",
};

const FORMAT_BADGE = {
  feed: { label: "Feed", icon: Newspaper },
  story: { label: "Story", icon: Clock },
  reel: { label: "Reel", icon: Film },
};

export const PostLivePreview = ({
  platform,
  format,
  accountName,
  accountAvatar,
  message,
  link,
  tags,
  images,
  currentIndex = 0,
  videoUrl,
  scheduleTime,
  aiGenerated,
  onExpandImage,
  onIndexChange,
}: PostLivePreviewProps) => {
  const badge = FORMAT_BADGE[format];
  const isVertical = format !== "feed";
  const aspect = isVertical
    ? "aspect-[9/16]"
    : FEED_ASPECT[platform?.toLowerCase() ?? ""] || "aspect-square";

  const hashtags = tags
    ?.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const hasMedia = images.length > 0 || !!videoUrl;
  const activeIndex = Math.min(currentIndex, Math.max(images.length - 1, 0));
  const canSlide = images.length > 1 && !!onIndexChange;

  const goTo = (next: number) => {
    if (!onIndexChange) return;
    onIndexChange((next + images.length) % images.length);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">
          Preview
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          <badge.icon className="w-3 h-3" />
          {badge.label}
        </span>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 overflow-hidden shrink-0">
            {accountAvatar ? (
              <img
                src={accountAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">
              {accountName || "No account selected"}
            </p>
            <p className="text-[11px] text-muted-foreground capitalize truncate">
              {platform || "No platform"}
            </p>
          </div>
        </div>

        {images.length > 0 && !videoUrl ? (
          <MediaFrame
            src={images[activeIndex]}
            alt={`Slide ${activeIndex + 1}`}
            className={aspect}
            onExpand={onExpandImage}
          >
            {images.length > 1 && (
              <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur">
                {activeIndex + 1}/{images.length}
              </span>
            )}

            {canSlide && (
              <>
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => goTo(activeIndex - 1)}
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => goTo(activeIndex + 1)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((url, idx) => (
                    <button
                      key={`${idx}-${url.slice(0, 16)}`}
                      type="button"
                      aria-label={`Go to slide ${idx + 1}`}
                      onClick={() => goTo(idx)}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        idx === activeIndex ? "bg-white" : "bg-white/50",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </MediaFrame>
        ) : (
          <div
            className={cn(
              "relative rounded-lg overflow-hidden bg-muted/40 border border-border/40",
              aspect,
            )}
          >
            {videoUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                <Play className="w-6 h-6" />
                <span className="text-[11px] px-2 text-center break-all line-clamp-2">
                  {videoUrl.split("/").pop()}
                </span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[11px]">No media yet</span>
              </div>
            )}
          </div>
        )}

        {images.length > 0 && !videoUrl && (
          <p className="text-[11px] text-muted-foreground text-center">
            Full image shown in a{" "}
            {isVertical ? "9:16 story frame" : "feed frame"}
          </p>
        )}

        {format !== "feed" && !hasMedia && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            A {format} needs {format === "reel" ? "a video" : "media"} before it
            can publish.
          </p>
        )}

        {message ? (
          <p className="text-xs leading-relaxed whitespace-pre-wrap line-clamp-6">
            {message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">No message</p>
        )}

        {hashtags && hashtags.length > 0 && (
          <p className="text-xs text-primary break-words">
            {hashtags.map((tag) => `#${tag}`).join(" ")}
          </p>
        )}

        {link && (
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground break-all">
            <Link2 className="w-3 h-3 mt-0.5 shrink-0" />
            {link}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/40">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {scheduleTime
              ? new Date(scheduleTime).toLocaleString()
              : "Publish now"}
          </span>
          {aiGenerated && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              AI-assisted
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
