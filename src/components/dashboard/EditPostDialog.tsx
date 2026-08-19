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
import { Clock, Film, Newspaper, Plus, Trash2 } from "lucide-react";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";
import {
  useUpdateSocialMediaPost,
  type SocialPostFormat,
} from "@/hooks/useSocialMediaPosting";

const FORMATS: {
  value: SocialPostFormat;
  label: string;
  icon: typeof Clock;
}[] = [
  { value: "feed", label: "Feed", icon: Newspaper },
  { value: "story", label: "Story", icon: Clock },
  { value: "reel", label: "Reel", icon: Film },
];

const VIDEO_PATTERN = /\.(mp4|mov|m4v|webm)(\?|#|$)/i;

interface EditPostDialogProps {
  post: SocialMediaPost | null;
  onClose: () => void;
}

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
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update this post before it is published. Published posts cannot be
            edited.
          </DialogDescription>
        </DialogHeader>

        {post && (
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
                    <span className="text-sm font-medium">{entry.label}</span>
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
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      className="mt-2"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
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
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <img
                          src={url}
                          alt={`Media ${idx + 1}`}
                          className="w-12 h-12 rounded object-cover shrink-0"
                        />
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
                      onChange={(event) => setNewMediaUrl(event.target.value)}
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
              <p className="text-xs text-amber-600 dark:text-amber-400">
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
              <Button onClick={save} disabled={updatePost.isPending || blocked}>
                {updatePost.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
