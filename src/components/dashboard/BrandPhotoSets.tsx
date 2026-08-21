import { BrandAssetPicker } from "@/components/dashboard/BrandAssetPicker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignGroupAssets,
  useGroupAssets,
  useUnassignGroupAsset,
} from "@/hooks/useAccountGroups";
import { cn } from "@/lib/utils";
import type { AccountGroup } from "@/types/accountGroup";
import { Images, Loader2, X } from "lucide-react";
import { useState } from "react";

/**
 * The photograph sets a brand publishes with, managed after it exists.
 *
 * A brand holding none draws from every approved set, so an empty list is a
 * working state rather than an unfinished one — and it says so.
 */
export function BrandPhotoSets({ group }: { group: AccountGroup }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<string[]>([]);
  const { data: assets = [], isLoading } = useGroupAssets(group.id, open);
  const assign = useAssignGroupAssets();
  const unassign = useUnassignGroupAsset();

  const held = new Set(assets.map((asset) => asset.id));
  const toAdd = picking.filter((id) => !held.has(id));

  return (
    <div className="border-t border-border/50 px-5 py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <Images className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        <span className="flex-1 text-[11px] font-bold uppercase tracking-wider text-dim-5">
          Photographs
        </span>
        <span className="text-xs text-dim-5">{open ? "Hide" : "Manage"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {isLoading && <Skeleton className="h-16 w-full" />}

          {!isLoading && assets.length === 0 && (
            <p className="text-xs text-muted-foreground">
              None of its own — this brand draws from every approved set.
            </p>
          )}

          {assets.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {assets.map((asset) => (
                <div key={asset.id} className="group relative">
                  <img
                    src={asset.images[0]?.url}
                    alt={asset.name}
                    title={`${asset.name} · ${asset.images.length} photo${
                      asset.images.length === 1 ? "" : "s"
                    }`}
                    loading="lazy"
                    className={cn(
                      "aspect-square w-full rounded-md border border-border object-cover",
                      !asset.approved && "opacity-50",
                    )}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${asset.name} from ${group.name}`}
                    disabled={unassign.isPending}
                    onClick={() =>
                      unassign.mutate({ id: group.id, assetId: asset.id })
                    }
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-overlay/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <BrandAssetPicker selected={picking} onChange={setPicking} />

          {toAdd.length > 0 && (
            <Button
              size="sm"
              disabled={assign.isPending}
              onClick={() =>
                assign.mutate(
                  { id: group.id, assetIds: toAdd },
                  { onSuccess: () => setPicking([]) },
                )
              }
            >
              {assign.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Add {toAdd.length} set{toAdd.length === 1 ? "" : "s"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
