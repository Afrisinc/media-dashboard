import { MediaLightbox } from "@/components/dashboard/MediaLightbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListRow } from "@/components/ui/list-row";
import {
  useApproveBrandAsset,
  useDeleteBrandAsset,
  useRemoveImageFromAsset,
  useUpdateBrandAsset,
} from "@/hooks/useBrandAssets";
import { cn } from "@/lib/utils";
import type { BrandAsset } from "@/services/brandAssetService";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

/** The subjects across a set's photographs, deduplicated. */
function subjectsOf(asset: BrandAsset): string[] {
  return [...new Set(asset.images.flatMap((image) => image.subjects ?? []))];
}

export function BrandAssetCard({ asset }: { asset: BrandAsset }) {
  const approve = useApproveBrandAsset();
  const remove = useDeleteBrandAsset();
  const removeImage = useRemoveImageFromAsset();
  const rename = useUpdateBrandAsset();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(asset.name);
  const [confirming, setConfirming] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const urls = asset.images.map((image) => image.url);
  const subjects = subjectsOf(asset);
  const used = asset.images.reduce(
    (total, image) => total + image.usageCount,
    0,
  );

  const openAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const commitName = () => {
    const name = draftName.trim();
    setEditing(false);
    if (name && name !== asset.name) {
      rename.mutate({ id: asset.id, payload: { name } });
    } else {
      setDraftName(asset.name);
    }
  };

  return (
    <Card className="p-4">
      <ListRow className="items-start">
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={`Open ${asset.name}`}
          className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-inset transition-opacity hover:opacity-80"
        >
          {urls[0] && (
            <img
              src={urls[0]}
              alt={asset.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </button>

        <div className="min-w-[160px] flex-1">
          {editing ? (
            <Input
              autoFocus
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitName();
                if (event.key === "Escape") {
                  setDraftName(asset.name);
                  setEditing(false);
                }
              }}
              maxLength={120}
              className="h-8 text-sm font-bold"
              aria-label="Set name"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="group flex items-center gap-1.5 text-left"
              title="Rename this set"
            >
              <span className="text-sm font-bold">{asset.name}</span>
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {asset.images.length} photograph
            {asset.images.length === 1 ? "" : "s"} · used {used}x
            {asset.description ? ` · ${asset.description}` : ""}
          </p>

          {subjects.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {subjects.slice(0, 8).map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="text-[10px]"
                >
                  {subject}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            variant={asset.approved ? "default" : "outline"}
            disabled={approve.isPending}
            onClick={() =>
              approve.mutate({ id: asset.id, approved: !asset.approved })
            }
            title={
              asset.approved
                ? "Approved — the agents can use it"
                : "Approve so the agents can use it"
            }
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            {asset.approved ? "Approved" : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => setConfirming(true)}
            title="Delete this set"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {asset.name}</span>
          </Button>
        </div>
      </ListRow>

      {asset.images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
          {asset.images.map((image, index) => (
            <div key={image.id} className="group relative">
              <button
                type="button"
                onClick={() => openAt(index)}
                aria-label={`Open ${image.reference}`}
                className="block aspect-square w-full overflow-hidden rounded-md border border-border transition-opacity hover:opacity-80"
              >
                <img
                  src={image.url}
                  alt={image.reference}
                  title={image.reference}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
              <button
                type="button"
                aria-label={`Remove ${image.reference} from ${asset.name}`}
                disabled={removeImage.isPending}
                onClick={() =>
                  removeImage.mutate({ id: asset.id, imageId: image.id })
                }
                className={cn(
                  "absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full",
                  "bg-overlay/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100",
                )}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaLightbox
        images={urls}
        index={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setLightboxIndex}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{asset.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The set and its {asset.images.length} photograph
              {asset.images.length === 1 ? "" : "s"} go away, and any brand
              using it falls back to the shared library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => remove.mutate(asset.id)}
            >
              Delete set
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
