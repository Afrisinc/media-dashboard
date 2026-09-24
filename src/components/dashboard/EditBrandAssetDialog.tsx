import { useEffect, useId, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { PhotoDropzone } from "@/components/dashboard/PhotoDropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLabel } from "@/components/ui/section-card";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import {
  useRemoveImageFromAsset,
  useSaveBrandAsset,
} from "@/hooks/useBrandAssets";
import { useStagedPhotos } from "@/hooks/useStagedPhotos";
import { parseUrls } from "@/lib/imageUrls";
import type {
  BrandAsset,
  BrandAssetUpdate,
} from "@/services/brandAssetService";

interface EditBrandAssetDialogProps {
  asset: BrandAsset;
  onClose: () => void;
  startAt?: "details" | "photos";
}

function subjectsOf(asset: BrandAsset): string[] {
  return [...new Set(asset.images.flatMap((image) => image.subjects ?? []))];
}

function sameTags(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((tag) => b.includes(tag));
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function footerNote(newPhotos: number, detail: string, dirty: boolean) {
  if (newPhotos > 0)
    return `${plural(newPhotos, "new photograph")} · ${detail}`;
  return dirty ? "Unsaved changes" : "No changes yet";
}

function saveLabel(newPhotos: number, busy: boolean): string {
  if (busy) return newPhotos > 0 ? "Uploading…" : "Saving…";
  return newPhotos > 0 ? `Save and add ${newPhotos}` : "Save changes";
}

export function EditBrandAssetDialog({
  asset,
  onClose,
  startAt = "details",
}: Readonly<EditBrandAssetDialogProps>) {
  const fieldId = useId();
  const addSection = useRef<HTMLElement>(null);

  useEffect(() => {
    if (startAt !== "photos") return;
    const frame = requestAnimationFrame(() =>
      addSection.current?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [startAt]);
  const save = useSaveBrandAsset();
  const removeImage = useRemoveImageFromAsset();
  const photos = useStagedPhotos();

  const [name, setName] = useState(asset.name);
  const [description, setDescription] = useState(asset.description ?? "");
  const [tags, setTags] = useState<string[]>(() => subjectsOf(asset));
  const [links, setLinks] = useState("");

  const urls = parseUrls(links);
  const originalTags = subjectsOf(asset);

  const changes: BrandAssetUpdate = {
    ...(name.trim() !== asset.name ? { name: name.trim() } : {}),
    ...(description.trim() !== (asset.description ?? "")
      ? { description: description.trim() }
      : {}),
    ...(!sameTags(tags, originalTags) ? { subjects: tags } : {}),
  };

  const newPhotos = photos.staged.length + urls.length;
  const dirty = Object.keys(changes).length > 0 || newPhotos > 0;
  const nameMissing = name.trim().length === 0;
  const busy = save.isPending;

  const handleSave = () => {
    save.mutate(
      {
        id: asset.id,
        changes,
        files: photos.staged.map((item) => item.file),
        urls,
        subjects: tags,
      },
      { onSuccess: onClose },
    );
  };

  const summary = [
    photos.staged.length > 0 && `${photos.staged.length} to upload`,
    urls.length > 0 && `${urls.length} linked`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Edit set</DialogTitle>
          <DialogDescription>
            Rename it, retag it, and add or remove photographs. New photographs
            take the set's tags.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section className="space-y-3">
            <SectionLabel>Details</SectionLabel>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-name`}>Name</Label>
              <Input
                id={`${fieldId}-name`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                disabled={busy}
                aria-invalid={nameMissing}
              />
              {nameMissing && (
                <p className="text-xs text-destructive">A set needs a name.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-description`}>Description</Label>
              <Textarea
                id={`${fieldId}-description`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={280}
                rows={2}
                disabled={busy}
                placeholder="When the agents should use this set"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-tags`}>Tags</Label>
              <TagInput
                id={`${fieldId}-tags`}
                value={tags}
                onChange={setTags}
                disabled={busy}
                placeholder="office, team, laptop"
              />
              <p className="text-xs text-muted-foreground">
                The agents match these against each slide. They apply to every
                photograph in the set.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <SectionLabel>In this set</SectionLabel>
              <span className="text-xs text-muted-foreground">
                {plural(asset.images.length, "photograph")}
              </span>
            </div>
            {asset.images.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No photographs yet. Add some below.
              </p>
            ) : (
              <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {asset.images.map((image) => {
                  const removing =
                    removeImage.isPending &&
                    removeImage.variables?.imageId === image.id;
                  return (
                    <li key={image.id} className="group relative">
                      <img
                        src={image.url}
                        alt={image.reference}
                        title={`${image.reference} · used ${image.usageCount}x`}
                        loading="lazy"
                        className="aspect-square w-full rounded-md border border-border object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${image.reference} from ${asset.name}`}
                        disabled={removeImage.isPending || busy}
                        onClick={() =>
                          removeImage.mutate({
                            id: asset.id,
                            imageId: image.id,
                          })
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-overlay/90 text-foreground transition-opacity reveal-on-hover after:absolute after:-inset-1 after:content-['']"
                      >
                        {removing ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section ref={addSection} className="scroll-mt-4 space-y-3">
            <SectionLabel>Add photographs</SectionLabel>
            <PhotoDropzone
              staged={photos.staged}
              onAdd={photos.add}
              onRemove={photos.remove}
              disabled={busy}
            />
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-links`}>Or paste image links</Label>
              <Textarea
                id={`${fieldId}-links`}
                value={links}
                onChange={(event) => setLinks(event.target.value)}
                rows={3}
                disabled={busy}
                placeholder={
                  "https://cdn.example/desk.jpg\nhttps://cdn.example/team.jpg"
                }
                className="font-mono text-xs"
              />
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border px-6 py-4">
          <span className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">
            {footerNote(newPhotos, summary, dirty)}
          </span>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!dirty || nameMissing || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saveLabel(newPhotos, busy)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
