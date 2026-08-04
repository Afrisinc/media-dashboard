import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PreviewItem {
  kind: string;
  title: string;
  status: string;
  channels: string[];
  metric?: string;
}

interface MediaPreviewDialogProps {
  item: PreviewItem | null;
  onClose: () => void;
}

export function MediaPreviewDialog({ item, onClose }: MediaPreviewDialogProps) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {item && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase tracking-wide">
                  {item.kind}
                </Badge>
                <Badge
                  variant={
                    item.status === "Published" ? "default" : "secondary"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <DialogTitle className="mt-1 text-lg">{item.title}</DialogTitle>
              <DialogDescription>
                Made automatically by your AI team — no human posted this.
              </DialogDescription>
            </DialogHeader>

            <div>
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Published to
              </p>
              <div className="flex flex-col gap-1.5">
                {item.channels.map((channel) => (
                  <div
                    key={channel}
                    className="flex items-center justify-between rounded-lg border border-border bg-inset px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{channel}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.status === "Published" ? "Live" : "Queued"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {item.metric && (
              <div className="rounded-lg border border-border bg-inset px-3 py-2.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Performance
                </p>
                <p className="mt-1 text-sm font-bold">{item.metric}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button className="flex-1">
                {item.status === "Published"
                  ? "Open live post"
                  : "Approve & publish"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
