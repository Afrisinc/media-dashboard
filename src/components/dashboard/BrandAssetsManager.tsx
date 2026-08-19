import { useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listBrandAssets,
  createBrandAsset,
  approveBrandAsset,
  deleteBrandAsset,
  describeError,
  type BrandAsset,
} from "@/services/brandAssetService";
import { cn } from "@/lib/utils";

const SUBJECTS_SUGGESTIONS = [
  "business",
  "people",
  "proof",
  "differentiator",
  "method",
  "professional",
  "lifestyle",
  "product",
  "office",
  "nature",
];

const BRIGHTNESS_OPTIONS = ["dark", "medium", "bright"] as const;
const SUBJECT_SIDES = ["left", "center", "right"] as const;

interface CreateAssetFormState {
  url: string;
  reference: string;
  subjects: string[];
  hasPerson: boolean;
  subjectSide: string;
  brightness: string;
  newSubject: string;
  imageLoading?: boolean;
  imageError?: string;
}

function AssetThumbnail({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="h-12 w-12 rounded-md bg-inset flex items-center justify-center flex-shrink-0">
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 rounded-md object-cover flex-shrink-0"
      onError={() => setImageError(true)}
    />
  );
}

export function BrandAssetsManager() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formState, setFormState] = useState<CreateAssetFormState>({
    url: "",
    reference: "",
    subjects: [],
    hasPerson: false,
    subjectSide: "center",
    brightness: "medium",
    newSubject: "",
    imageLoading: false,
    imageError: undefined,
  });

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["brandAssets"],
    queryFn: listBrandAssets,
  });

  const createMutation = useMutation({
    mutationFn: createBrandAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandAssets"] });
      setShowCreateDialog(false);
      setFormState({
        url: "",
        reference: "",
        subjects: [],
        hasPerson: false,
        subjectSide: "center",
        brightness: "medium",
        newSubject: "",
        imageLoading: false,
        imageError: undefined,
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      approveBrandAsset(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandAssets"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrandAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandAssets"] });
    },
  });

  const handleAddSubject = () => {
    if (
      formState.newSubject.trim() &&
      !formState.subjects.includes(formState.newSubject)
    ) {
      setFormState((prev) => ({
        ...prev,
        subjects: [...prev.subjects, prev.newSubject.toLowerCase()],
        newSubject: "",
      }));
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
  };

  const handleCreateAsset = () => {
    if (!formState.url.trim() || !formState.reference.trim()) {
      alert("URL and Reference are required");
      return;
    }

    createMutation.mutate({
      url: formState.url,
      reference: formState.reference,
      subjects: formState.subjects,
      hasPerson: formState.hasPerson,
      subjectSide: formState.subjectSide as "left" | "center" | "right",
      brightness: formState.brightness as "dark" | "medium" | "bright",
    });
  };

  const approvedCount = assets.filter((a) => a.approved).length;

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-bold">Brand Assets</p>
              <p className="mb-4 text-xs text-muted-foreground">
                {approvedCount} of {assets.length} approved · Used in post
                generation
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Asset
            </Button>
          </div>

          {/* Assets Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading assets…
              </span>
            </div>
          ) : assets.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No brand assets yet. Add your first photo to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-lg border border-border/60 bg-background p-4"
                >
                  {/* Top Row: Thumbnail + Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <AssetThumbnail src={asset.url} alt={asset.reference} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {asset.reference}
                      </p>
                      {asset.subjects && asset.subjects.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {asset.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}
                      {asset.brightness && (
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          {asset.hasPerson ? "👤 Has people" : "No people"} ·{" "}
                          {asset.brightness} brightness
                          {asset.subjectSide && ` · ${asset.subjectSide} side`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Stats + Actions */}
                  <div className="flex items-center justify-between gap-3 pl-15">
                    <div className="text-[11px] text-muted-foreground">
                      <span>Used {asset.usageCount}x</span>
                      {asset.lastUsedAt && (
                        <span className="ml-2">
                          {new Date(asset.lastUsedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Approve Toggle */}
                      <button
                        onClick={() =>
                          approveMutation.mutate({
                            id: asset.id,
                            approved: !asset.approved,
                          })
                        }
                        disabled={approveMutation.isPending}
                        className={cn(
                          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-colors",
                          asset.approved
                            ? "border-green-500 bg-green-500/20 text-green-600 hover:bg-green-500/30"
                            : "border-border/60 bg-inset text-muted-foreground hover:bg-inset-hover",
                        )}
                        title={
                          asset.approved
                            ? "Approved · Click to reject"
                            : "Not approved · Click to approve"
                        }
                        type="button"
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : asset.approved ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => {
                          if (confirm(`Delete "${asset.reference}"?`)) {
                            deleteMutation.mutate(asset.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Asset Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Brand Asset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* URL Input */}
            <div>
              <label className="text-sm font-semibold">Image URL *</label>
              <Input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formState.url}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    url: e.target.value,
                    imageLoading: true,
                    imageError: undefined,
                  }))
                }
                className="mt-1"
              />
            </div>

            {/* Reference Input */}
            <div>
              <label className="text-sm font-semibold">Reference *</label>
              <p className="text-xs text-muted-foreground mb-1">
                Unique identifier (e.g., business-photo-001)
              </p>
              <Input
                placeholder="business-photo-001"
                value={formState.reference}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    reference: e.target.value,
                  }))
                }
              />
            </div>

            {/* Preview */}
            {formState.url && (
              <div className="rounded-lg border border-border/60 overflow-hidden bg-inset">
                <div className="relative w-full max-h-48 bg-inset">
                  <img
                    src={formState.url}
                    alt="Preview"
                    className={cn(
                      "w-full h-48 object-cover transition-opacity",
                      formState.imageLoading ? "opacity-0" : "opacity-100",
                    )}
                    onLoad={() =>
                      setFormState((prev) => ({
                        ...prev,
                        imageLoading: false,
                        imageError: undefined,
                      }))
                    }
                    onError={() =>
                      setFormState((prev) => ({
                        ...prev,
                        imageLoading: false,
                        imageError: "Failed to load image from URL",
                      }))
                    }
                  />

                  {/* Loading State */}
                  {formState.imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-inset/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Loading preview…
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {formState.imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2 px-4 text-center">
                        <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-destructive">
                            Failed to load image
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Check the URL is accessible or try a different image
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subjects */}
            <div>
              <label className="text-sm font-semibold">Subjects</label>
              <p className="text-xs text-muted-foreground mb-2">
                Tags for categorization (e.g., business, proof)
              </p>
              <div className="flex gap-1 mb-2 flex-wrap">
                {formState.subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleRemoveSubject(subject)}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs text-primary hover:bg-primary/30"
                  >
                    {subject}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  type="text"
                  placeholder="Type and press Enter"
                  value={formState.newSubject}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      newSubject: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubject}
                  className="flex-shrink-0"
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {SUBJECTS_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      if (!formState.subjects.includes(suggestion)) {
                        setFormState((prev) => ({
                          ...prev,
                          subjects: [...prev.subjects, suggestion],
                        }));
                      }
                    }}
                    disabled={formState.subjects.includes(suggestion)}
                    className={cn(
                      "rounded-full px-2 py-1 text-[11px] border transition-colors",
                      formState.subjects.includes(suggestion)
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border/60 bg-background hover:bg-inset",
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Brightness</label>
                <select
                  value={formState.brightness}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      brightness: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                >
                  {BRIGHTNESS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Subject Side</label>
                <select
                  value={formState.subjectSide}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      subjectSide: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                >
                  {SUBJECT_SIDES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Has Person */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-inset px-3 py-2">
              <label className="text-sm font-semibold">Contains people</label>
              <Switch
                checked={formState.hasPerson}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, hasPerson: checked }))
                }
              />
            </div>

            {/* Error Message */}
            {createMutation.isError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {describeError(createMutation.error)}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAsset}
                disabled={
                  createMutation.isPending ||
                  !formState.url.trim() ||
                  !formState.reference.trim()
                }
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Create Asset
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              New assets are created unapproved. Use the checkmark icon to
              approve them for use.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
