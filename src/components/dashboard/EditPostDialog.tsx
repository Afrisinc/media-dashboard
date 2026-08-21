import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Clock,
  Film,
  Newspaper,
  Plus,
  Trash2,
  ZoomIn,
  Check,
  X,
} from "lucide-react";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";
import {
  useUpdateSocialMediaPost,
  type SocialPostFormat,
} from "@/hooks/useSocialMediaPosting";
import { MediaLightbox } from "./MediaLightbox";

const FORMATS: {
  value: SocialPostFormat;
  label: string;
  icon: typeof Clock;
  aspectRatio: string;
}[] = [
  { value: "feed", label: "Feed", icon: Newspaper, aspectRatio: "1/1" },
  { value: "story", label: "Story", icon: Clock, aspectRatio: "9/16" },
  { value: "reel", label: "Reel", icon: Film, aspectRatio: "9/16" },
];

const VIDEO_PATTERN = /\.(mp4|mov|m4v|webm)(\?|#|$)/i;

interface EditPostDialogProps {
  post: SocialMediaPost | null;
  onClose: () => void;
}

interface ChecklistRowProps {
  label: string;
  done: boolean;
  /** Optional requirements read as neutral guidance, not as an error. */
  optional?: boolean;
}

const ChecklistRow = ({ label, done, optional }: ChecklistRowProps) => {
  let marker = <X className="w-4 h-4 shrink-0 text-destructive" aria-hidden />;

  if (done) {
    marker = (
      <Check
        className={cn(
          "w-4 h-4 shrink-0",
          optional ? "text-primary" : "text-emerald",
        )}
        aria-hidden
      />
    );
  } else if (optional) {
    marker = (
      <span
        className="w-4 h-4 shrink-0 rounded-full border border-muted-foreground/50"
        aria-hidden
      />
    );
  }

  return (
    <li className="flex items-center gap-2 text-xs">
      {marker}
      <span className={done ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </li>
  );
};

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export const EditPostDialog = ({ post, onClose }: EditPostDialogProps) => {
  const updatePost = useUpdateSocialMediaPost();

  const [format, setFormat] = useState<SocialPostFormat>("feed");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [altText, setAltText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    if (!post) return;

    const urls = post.mediaUrls ?? [];
    const video = urls.find((url) => VIDEO_PATTERN.test(url));

    setFormat((post.postFormat as SocialPostFormat) || "feed");
    setMessage(post.message ?? "");
    setLink(post.link ?? "");
    setDescription(post.description ?? "");
    setCaption(post.caption ?? "");
    setTags(post.tags?.join(", ") ?? "");
    setAltText(post.altText ?? "");
    setVideoUrl(video ?? "");
    setMediaUrls(video ? [] : urls);
    setNewMediaUrl("");
    setScheduleTime(toLocalInput(post.scheduledAt));
  }, [post]);

  const singleMedia = format !== "feed";
  const effectiveUrls = videoUrl ? [videoUrl] : mediaUrls;
  const mediaType = videoUrl
    ? "video"
    : effectiveUrls.length > 1
      ? "carousel"
      : "image";

  const missingMedia = singleMedia && effectiveUrls.length === 0;
  const missingReelVideo = format === "reel" && !videoUrl;
  const missingMessage = format === "feed" && !message.trim();
  const blocked = missingMedia || missingReelVideo || missingMessage;

  const checklist: ChecklistRowProps[] = [
    {
      label: effectiveUrls.length > 0 ? "Media added" : "Media required",
      done: effectiveUrls.length > 0,
    },
    {
      label: missingMessage
        ? `Message required for ${format}`
        : "Message added",
      done: !missingMessage,
    },
    {
      label: missingReelVideo ? `Video required for ${format}` : "Video added",
      done: !missingReelVideo,
    },
    {
      label: scheduleTime ? "Scheduled" : "Will post immediately",
      done: !!scheduleTime,
      optional: true,
    },
  ];

  const isVideo = !!videoUrl;
  const currentMedia = effectiveUrls[0];

  const addMediaUrl = () => {
    const url = newMediaUrl.trim();
    if (!url) return;
    setMediaUrls([...mediaUrls, url]);
    setNewMediaUrl("");
  };

  const save = () => {
    if (!post) return;

    updatePost.mutate(
      {
        postId: post.id,
        payload: {
          format,
          content: {
            message: message || undefined,
            link: link || undefined,
            description: description || undefined,
            caption: caption || undefined,
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          },
          media:
            effectiveUrls.length > 0
              ? {
                  type: mediaType,
                  urls: effectiveUrls,
                  url: effectiveUrls[0],
                  alt_text: altText || undefined,
                }
              : undefined,
          scheduling: scheduleTime
            ? {
                scheduled_publish_time: Math.floor(
                  new Date(scheduleTime).getTime() / 1000,
                ),
              }
            : { publish_immediately: true },
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <>
      <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update this post before it is published. Published posts cannot be
              edited.
            </DialogDescription>
          </DialogHeader>

          {post && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Post Format</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {FORMATS.map((entry) => (
                      <button
                        key={entry.value}
                        type="button"
                        onClick={() => setFormat(entry.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                          format === entry.value
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-border bg-muted/20",
                        )}
                      >
                        <entry.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {entry.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Message {format === "feed" ? "*" : "(optional)"}
                  </label>
                  <Textarea
                    className="mt-2 min-h-24 resize-none"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Enter your post message..."
                  />
                </div>

                {format === "feed" && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Link</label>
                      <Input
                        className="mt-2"
                        type="url"
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Input
                          className="mt-2"
                          value={description}
                          onChange={(event) =>
                            setDescription(event.target.value)
                          }
                          placeholder="Link description"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Caption</label>
                        <Input
                          className="mt-2"
                          value={caption}
                          onChange={(event) => setCaption(event.target.value)}
                          placeholder="Caption"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium">Tags / Hashtags</label>
                  <Input
                    className="mt-2"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Video URL {format === "reel" ? "*" : ""}
                  </label>
                  <Input
                    className="mt-2"
                    type="url"
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    placeholder="https://cdn.example.com/clip.mp4"
                  />
                  {format === "reel" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      9:16, 3–90 seconds, public https URL
                    </p>
                  )}
                </div>

                {!videoUrl && (
                  <div>
                    <label className="text-sm font-medium">
                      {singleMedia ? "Image" : "Images"}
                    </label>

                    {mediaUrls.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {mediaUrls.map((url, idx) => (
                          <div
                            key={`${idx}-${url.slice(0, 24)}`}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => setLightboxIndex(idx)}
                              className="shrink-0 rounded hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={`Open image ${idx + 1} full size`}
                            >
                              <img
                                src={url}
                                alt={`Media ${idx + 1}`}
                                className="w-12 h-12 rounded object-cover cursor-zoom-in"
                              />
                            </button>
                            <span className="text-xs text-muted-foreground truncate flex-1">
                              {url}
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove image ${idx + 1}`}
                              onClick={() =>
                                setMediaUrls(
                                  mediaUrls.filter((_, index) => index !== idx),
                                )
                              }
                              className="text-destructive hover:text-destructive/80 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!singleMedia || mediaUrls.length === 0) && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newMediaUrl}
                          onChange={(event) =>
                            setNewMediaUrl(event.target.value)
                          }
                          placeholder="https://cdn.example.com/image.jpg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addMediaUrl}
                          aria-label="Add image URL"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {singleMedia && (
                      <p className="text-xs text-muted-foreground mt-1">
                        A {format} takes a single piece of media.
                      </p>
                    )}
                  </div>
                )}

                {effectiveUrls.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Alt Text</label>
                    <Input
                      className="mt-2"
                      value={altText}
                      onChange={(event) => setAltText(event.target.value)}
                      placeholder="Describe the media for accessibility"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Schedule</label>
                  <Input
                    className="mt-2"
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(event) => setScheduleTime(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Clear to publish on the next run.
                  </p>
                </div>

                {blocked && (
                  <p className="text-xs text-amber">
                    {missingMessage
                      ? "A feed post needs a message."
                      : missingReelVideo
                        ? "A reel needs a video."
                        : `A ${format} needs an image or a video.`}
                  </p>
                )}

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={save}
                    disabled={updatePost.isPending || blocked}
                  >
                    {updatePost.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              <div className="hidden lg:flex flex-col gap-4 sticky top-0">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Preview & Checklist</h3>

                  <div
                    className="rounded-lg bg-muted/20 border border-border/50 overflow-hidden flex items-center justify-center relative"
                    style={{
                      aspectRatio: format === "feed" ? "1/1" : "9/16",
                    }}
                  >
                    {isVideo ? (
                      <video
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : currentMedia ? (
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(0)}
                        className="group w-full h-full relative cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Open preview full size"
                      >
                        <img
                          src={currentMedia}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-overlay/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                          <ZoomIn className="w-6 h-6 text-background" />
                        </span>
                      </button>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No media yet
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-xs font-medium">Checklist</div>
                    <ul className="space-y-1.5">
                      {checklist.map((item) => (
                        <ChecklistRow key={item.label} {...item} />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MediaLightbox
        images={mediaUrls}
        index={lightboxIndex}
        open={lightboxIndex >= 0}
        onOpenChange={(open) => !open && setLightboxIndex(-1)}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
};
