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
import { Images, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BulkAddAssetsDialogProps {
  open: boolean;
  onClose: () => void;
}

/** A file waiting to be uploaded, with a preview the browser can draw. */
interface StagedFile {
  file: File;
  preview: string;
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
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setRaw("");
      setName("");
      setSubjects("");
      setStaged([]);
      setDragging(false);
    }
  }, [open]);

  // Object URLs are held by the browser until they are revoked.
  useEffect(
    () => () => staged.forEach((item) => URL.revokeObjectURL(item.preview)),
    [staged],
  );

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

  const stageFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) return;

    setStaged((current) => [
      ...current,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const unstage = (preview: string) => {
    URL.revokeObjectURL(preview);
    setStaged((current) => current.filter((item) => item.preview !== preview));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add brand asset</DialogTitle>
          <DialogDescription>
            A brand asset is a named set of photographs. Upload files or paste
            links — they all go into one set you can assign to a brand.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
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

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            stageFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border bg-inset",
          )}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-semibold">Drop photographs here</p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP or GIF · up to 12MB each
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(event) => {
              stageFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-1"
            disabled={create.isPending}
            onClick={() => fileInput.current?.click()}
          >
            Choose files
          </Button>
        </div>

        {staged.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {staged.map((item) => (
              <div key={item.preview} className="group relative">
                <img
                  src={item.preview}
                  alt={item.file.name}
                  title={item.file.name}
                  className="aspect-square w-full rounded-md border border-border object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove ${item.file.name}`}
                  onClick={() => unstage(item.preview)}
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-overlay/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

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

        <div className="flex items-center gap-2.5 border-t border-border pt-4">
          <Images className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="flex-1 text-xs text-muted-foreground">
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
