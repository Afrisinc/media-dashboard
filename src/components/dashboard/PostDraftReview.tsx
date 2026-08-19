import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MediaLightbox } from "./MediaLightbox";
import {
  useApprovePostDraft,
  useRejectPostDraft,
  useRerenderPostDraft,
} from "@/hooks/usePostAgent";
import {
  blockingFindings,
  FORMAT_LABELS,
  STATUS_LABELS,
  STATUS_VARIANT,
  type PostDraft,
} from "@/types/postAgent";
import { AlertTriangle, CalendarClock, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

function formatSlot(value: string | null): string {
  if (!value) return "not queued";
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  draft: PostDraft;
}

export function PostDraftReview({ draft }: Props) {
  const approve = useApprovePostDraft();
  const reject = useRejectPostDraft();
  const rerender = useRerenderPostDraft();

  const [signedOff, setSignedOff] = useState<Record<string, boolean>>({});
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const blockers = blockingFindings(draft);
  // The claims are the reason this gate exists: every promise the agent made
  // has to be ticked by a person before the artwork can be released.
  const allClaimsSignedOff = draft.claims.every((claim) => signedOff[claim]);
  const canApprove =
    draft.auditPassed &&
    draft.slideUrls.length > 0 &&
    allClaimsSignedOff &&
    !approve.isPending;

  const isPortrait = draft.format === "story";

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate">{draft.topic}</CardTitle>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{FORMAT_LABELS[draft.format]}</span>
            <span>·</span>
            <span>
              {draft.slideUrls.length}{" "}
              {draft.slideUrls.length === 1 ? "frame" : "frames"}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {formatSlot(draft.scheduledAt)}
            </span>
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[draft.status]}>
          {STATUS_LABELS[draft.status]}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        {draft.slideUrls.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {draft.slideUrls.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                className={
                  isPortrait
                    ? "h-64 w-36 shrink-0 rounded-md border object-cover hover:opacity-80 transition-opacity cursor-pointer"
                    : "h-40 w-40 shrink-0 rounded-md border object-cover hover:opacity-80 transition-opacity cursor-pointer"
                }
              >
                <img
                  src={url}
                  alt={`${draft.topic} — frame ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-md"
                />
              </button>
            ))}
          </div>
        )}

        {blockers.length > 0 && (
          <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              The craft audit blocked this
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {blockers.map((finding, index) => (
                <li key={`${finding.rule}-${index}`}>
                  Frame {finding.slide + 1} — {finding.detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {draft.caption && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Caption
            </Label>
            <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
              {draft.caption}
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Claims to sign off
          </Label>
          {draft.claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This draft promises nothing that needs checking.
            </p>
          ) : (
            <ul className="space-y-2">
              {draft.claims.map((claim) => (
                <li key={claim} className="flex items-start gap-3">
                  <Checkbox
                    id={`${draft.id}-${claim}`}
                    checked={Boolean(signedOff[claim])}
                    onCheckedChange={(checked) =>
                      setSignedOff((current) => ({
                        ...current,
                        [claim]: checked === true,
                      }))
                    }
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={`${draft.id}-${claim}`}
                    className="text-sm leading-snug"
                  >
                    {claim}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => approve.mutate(draft.id)}
            disabled={!canApprove}
          >
            {approve.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Approve & schedule
          </Button>
          <Button
            variant="outline"
            onClick={() => setRejecting(true)}
            disabled={reject.isPending}
          >
            Reject
          </Button>
          <Button
            variant="ghost"
            onClick={() => rerender.mutate(draft.id)}
            disabled={rerender.isPending}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${rerender.isPending ? "animate-spin" : ""}`}
            />
            Re-render
          </Button>

          {!allClaimsSignedOff && draft.claims.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Tick every claim before approving.
            </p>
          )}
        </div>
      </CardContent>

      <Dialog open={rejecting} onOpenChange={setRejecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this draft</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`reason-${draft.id}`}>Why?</Label>
            <Textarea
              id={`reason-${draft.id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="The turnaround claim is not something we can promise."
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              The posts already queued for this draft are cancelled.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={reason.trim().length < 3 || reject.isPending}
              onClick={() =>
                reject.mutate(
                  { id: draft.id, reason: reason.trim() },
                  {
                    onSuccess: () => {
                      setRejecting(false);
                      setReason("");
                    },
                  },
                )
              }
            >
              {reject.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox for viewing slides */}
      <MediaLightbox
        images={draft.slideUrls}
        index={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setLightboxIndex}
      />
    </Card>
  );
}
