import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PlatformPreviewProps {
  images: string[];
  platform: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  message?: string;
  pageName?: string;
  pageAvatar?: string;
}

const PLATFORM_ASPECT_RATIOS: Record<
  string,
  { ratio: number; label: string; width: number; height: number }
> = {
  instagram: {
    ratio: 4 / 5,
    label: "Instagram Feed (4:5)",
    width: 480,
    height: 600,
  },
  facebook: {
    ratio: 1.91 / 1,
    label: "Facebook Feed (1.91:1)",
    width: 480,
    height: 252,
  },
  twitter: { ratio: 16 / 9, label: "Twitter (16:9)", width: 480, height: 270 },
  linkedin: {
    ratio: 1.91 / 1,
    label: "LinkedIn Feed (1.91:1)",
    width: 480,
    height: 252,
  },
  tiktok: { ratio: 9 / 16, label: "TikTok (9:16)", width: 270, height: 480 },
};

export const PlatformPreview = ({
  images,
  platform,
  currentIndex,
  onIndexChange,
  message,
  pageName,
  pageAvatar,
}: PlatformPreviewProps) => {
  if (!images || images.length === 0) return null;

  const config =
    PLATFORM_ASPECT_RATIOS[platform.toLowerCase()] ||
    PLATFORM_ASPECT_RATIOS.instagram;
  const currentImage = images[currentIndex];
  const isFacebook = platform.toLowerCase() === "facebook";

  const handlePrev = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  // Extract hashtags from message
  const hashtags = message?.match(/#\w+/g) || [];
  const messageWithoutHashtags = message?.replace(/#\w+/g, "").trim() || "";

  if (isFacebook) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Preview</h3>
          <span className="text-xs text-muted-foreground">{config.label}</span>
        </div>

        {/* Facebook Post Preview */}
        <div className="bg-white dark:bg-muted rounded-lg overflow-hidden shadow-lg w-full">
          {/* Post Header */}
          <div className="p-4 border-b border-border/20 dark:border-border/50">
            <div className="flex items-center gap-3">
              {pageAvatar ? (
                <img
                  src={pageAvatar}
                  alt="Page avatar"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                  {pageName?.charAt(0) || "P"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {pageName || "Page Name"}
                </p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
          </div>

          {/* Post Image */}
          <div className="relative bg-muted overflow-hidden">
            <img
              src={currentImage}
              alt={`Preview ${currentIndex + 1}`}
              className="w-full object-cover"
              style={{
                aspectRatio: `${config.ratio}`,
              }}
            />

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slide Counter */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {currentIndex + 1}/{images.length}
                </div>
              </>
            )}
          </div>

          {/* Post Content */}
          <div className="p-4 space-y-2">
            {messageWithoutHashtags && (
              <p className="text-sm text-foreground leading-normal">
                {messageWithoutHashtags}
              </p>
            )}
            {hashtags.length > 0 && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {hashtags.join(" ")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Instagram/Twitter/LinkedIn/TikTok Preview
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Preview</h3>
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </div>

      {/* Main Preview */}
      <div
        className="relative mx-auto bg-muted rounded-lg overflow-hidden shadow-lg"
        style={{
          width: `${config.width}px`,
          height: `${config.height}px`,
          maxWidth: "100%",
        }}
      >
        <img
          src={currentImage}
          alt={`Preview ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Message Overlay (for Instagram) */}
        {message && platform.toLowerCase() === "instagram" && (
          <div className="absolute inset-0 bg-black/40 flex items-end p-4">
            <p className="text-white text-sm line-clamp-3">{message}</p>
          </div>
        )}

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onIndexChange(idx)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    idx === currentIndex
                      ? "bg-white w-3"
                      : "bg-white/50 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 px-1">
          {images.map((img, idx) => (
            <button
              key={`thumb-${idx}`}
              onClick={() => onIndexChange(idx)}
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded border-2 transition-all overflow-hidden hover:opacity-80",
                idx === currentIndex
                  ? "border-primary shadow-md"
                  : "border-border/50",
              )}
            >
              <img
                src={img}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center pt-1">
        {images.length > 1 && `Slide ${currentIndex + 1} of ${images.length}`}
      </div>
    </div>
  );
};
