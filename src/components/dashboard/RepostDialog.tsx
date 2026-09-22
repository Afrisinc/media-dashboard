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
import { Loader2, Repeat } from "lucide-react";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";
import { useRepostSocialMediaPost } from "@/hooks/useSocialMediaPosting";

interface RepostDialogProps {
  post: SocialMediaPost | null;
  onClose: () => void;
}

function nextHourInput() {
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
  const offset = inOneHour.getTimezoneOffset() * 60000;
  return new Date(inOneHour.getTime() - offset).toISOString().slice(0, 16);
}

export const RepostDialog = ({ post, onClose }: RepostDialogProps) => {
  const repostPost = useRepostSocialMediaPost();
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    if (post) setScheduleTime(nextHourInput());
  }, [post]);

  const repost = () => {
    if (!post) return;

    repostPost.mutate(
      {
        postId: post.id,
        scheduledAt: scheduleTime
          ? Math.floor(new Date(scheduleTime).getTime() / 1000)
          : undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Repost</DialogTitle>
          <DialogDescription>
            Reschedule this published post as a new post. The original post and
            its metrics stay untouched.
          </DialogDescription>
        </DialogHeader>

        {post && (
          <div className="space-y-4">
            <p className="text-sm text-foreground line-clamp-3 bg-muted/30 rounded-lg p-3 border border-border/50">
              {post.message || "(No message)"}
            </p>

            <div>
              <label className="text-sm font-medium">Repost time</label>
              <Input
                className="mt-2"
                type="datetime-local"
                value={scheduleTime}
                onChange={(event) => setScheduleTime(event.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Clear the field to queue it for the next scheduled run.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={repost} disabled={repostPost.isPending}>
                {repostPost.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Repeat className="w-4 h-4 mr-2" />
                )}
                Repost
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
