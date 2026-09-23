import { useState } from "react";
import { ImageOff, Layers, Play, Type } from "lucide-react";
import { isVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";

interface PostMediaPreviewProps {
  post: Pick<
    SocialMediaPost,
    "mediaUrls" | "mediaType" | "altText" | "message"
  >;
  variant?: "cover" | "thumb";
  className?: string;
}

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
    {children}
  </span>
);

export function PostMediaPreview({
  post,
  variant = "cover",
  className,
}: PostMediaPreviewProps) {
  const [failed, setFailed] = useState(false);
  const urls = post.mediaUrls ?? [];
  const cover = urls[0];
  const isThumb = variant === "thumb";

  if (!cover || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground",
          !isThumb && "p-5",
          className,
        )}
      >
        {failed ? (
          <ImageOff className={isThumb ? "h-4 w-4" : "h-6 w-6"} />
        ) : isThumb || !post.message ? (
          <Type className={isThumb ? "h-4 w-4" : "h-6 w-6"} />
        ) : (
          <p className="line-clamp-6 text-center font-display text-lg italic leading-snug text-foreground/80">
            {post.message}
          </p>
        )}
        {!isThumb && (
          <span className="text-[11px] font-medium uppercase tracking-wide">
            {failed ? "Image unavailable" : "Text post"}
          </span>
        )}
      </div>
    );
  }

  const video = isVideoUrl(cover, post.mediaType);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-muted",
        className,
      )}
    >
      {video ? (
        <video
          src={`${cover}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={cover}
          alt={post.altText || post.message || "Post media"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={() => setFailed(true)}
        />
      )}

      {isThumb ? (
        (video || urls.length > 1) && (
          <span className="absolute bottom-0.5 right-0.5 inline-flex items-center gap-0.5 rounded bg-background/85 px-1 text-[10px] font-semibold text-foreground">
            {video ? (
              <Play className="h-2.5 w-2.5 fill-current" />
            ) : (
              urls.length
            )}
          </span>
        )
      ) : (
        <div className="pointer-events-none absolute bottom-2 left-2 flex gap-1">
          {video && (
            <Chip>
              <Play className="h-3 w-3 fill-current" />
              Video
            </Chip>
          )}
          {urls.length > 1 && (
            <Chip>
              <Layers className="h-3 w-3" />1 / {urls.length}
            </Chip>
          )}
        </div>
      )}
    </div>
  );
}
