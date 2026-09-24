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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { parseUrls } from "@/lib/imageUrls";
import { cn } from "@/lib/utils";
import {
  addImagesToAsset,
  createBrandAssets,
  uploadBrandAssets,
  type BrandAsset,
} from "@/services/brandAssetService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PhotoDropzone } from "@/components/dashboard/PhotoDropzone";
import { useStagedPhotos } from "@/hooks/useStagedPhotos";
import { Images, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BulkAddAssetsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A brand asset is a named set of photographs, so nothing is sent until the set
 * is described. Picking files stages them; **Create set** is what uploads.
 */
export function BulkAddAssetsDialog({
  open,
  onClose,
}: BulkAddAssetsDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [raw, setRaw] = useState("");
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState("");
  const photos = useStagedPhotos();
  const { staged, clear: clearPhotos } = photos;

  useEffect(() => {
    if (open) {
      setRaw("");
      setName("");
      setSubjects("");
      clearPhotos();
    }
  }, [open, clearPhotos]);

  const urls = parseUrls(raw);

  /** Tags apply to every photograph in the set — that is what a set is for. */
  const tags = subjects
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  const total = staged.length + urls.length;

  const create = useMutation({
    mutationFn: async (): Promise<BrandAsset> => {
      const setName = name.trim() || undefined;
      let asset: BrandAsset | undefined;

      // Uploads and links land in one set, not two.
      if (staged.length) {
        asset = (
          await uploadBrandAssets(
            staged.map((item) => item.file),
            setName,
            tags,
          )
        ).asset;
      }

      if (urls.length) {
        const images = urls.map((url) => ({ url, subjects: tags }));
        asset = asset
          ? await addImagesToAsset(asset.id, images)
          : (await createBrandAssets(images, setName)).asset;
      }

      if (!asset) {
        throw new Error("Add at least one photograph");
      }
      return asset;
    },
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: ["brandAssets"] });
      toast({
        title: `“${asset.name}” created`,
        description: `${asset.images.length} photograph${
          asset.images.length === 1 ? "" : "s"
        }. Approve it to let the agents use it.`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: error.message });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add brand asset</DialogTitle>
          <DialogDescription>
            A brand asset is a named set of photographs. Upload files or paste
            links — they all go into one set you can assign to a brand.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="set-name">Name</Label>
            <Input
              id="set-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Repair bench shots"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="set-subjects">Subjects</Label>
            <Input
              id="set-subjects"
              value={subjects}
              onChange={(event) => setSubjects(event.target.value)}
              placeholder="bench, technician, workshop"
            />
          </div>
        </div>
        <p className="-mt-1 text-xs text-muted-foreground">
          Both optional. Subjects help the agents pick a photograph that suits
          the slide; the name falls back to today's date.
        </p>

        <PhotoDropzone
          staged={staged}
          onAdd={photos.add}
          onRemove={photos.remove}
          disabled={create.isPending}
        />

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-dim-6">
            or paste links
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulk-urls">Image URLs</Label>
          <Textarea
            id="bulk-urls"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            placeholder={
              "https://cdn.example/bench.jpg\nhttps://cdn.example/office.jpg"
            }
            rows={4}
            className="font-mono text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border pt-4">
          <Images className="hidden h-4 w-4 flex-shrink-0 text-muted-foreground sm:block" />
          <span className="w-full sm:w-auto sm:flex-1 text-xs text-muted-foreground">
            {total === 0
              ? "Nothing added yet."
              : `${total} photograph${total === 1 ? "" : "s"} ready` +
                (staged.length && urls.length
                  ? ` · ${staged.length} to upload, ${urls.length} linked`
                  : "")}
          </span>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => create.mutate()}
            disabled={total === 0 || create.isPending}
          >
            {create.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {create.isPending
              ? "Creating…"
              : `Create set${total > 0 ? ` (${total})` : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
