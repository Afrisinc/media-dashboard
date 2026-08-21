import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrandAssets } from "@/hooks/useBrandAssets";
import { cn } from "@/lib/utils";
import { Check, ImageOff } from "lucide-react";
import { Link } from "react-router-dom";

interface BrandAssetPickerProps {
  selected: string[];
  onChange: (assetIds: string[]) => void;
}

/**
 * Which photograph sets a brand publishes with.
 *
 * Picking nothing is a real choice — the brand then draws from every approved
 * set — but an empty grid does not say that, so the choice is stated as two
 * explicit options rather than implied by a blank selection.
 */
export function BrandAssetPicker({
  selected,
  onChange,
}: BrandAssetPickerProps) {
  const { data: assets = [], isLoading } = useBrandAssets();

  const approved = assets.filter((asset) => asset.approved);
  const chosen = new Set(selected);
  const usingAll = selected.length === 0;

  const toggle = (id: string) =>
    onChange(
      chosen.has(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (approved.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-inset px-3.5 py-3">
        <ImageOff className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <p className="min-w-[180px] flex-1 text-xs text-muted-foreground">
          No approved photo sets yet. A brand needs at least one to render its
          frames.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link to="/settings">Add photos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex rounded-lg bg-muted p-1">
        <button
          type="button"
          aria-pressed={usingAll}
          onClick={() => onChange([])}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
            usingAll
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Every approved set
        </button>
        <button
          type="button"
          aria-pressed={!usingAll}
          onClick={() =>
            onChange(selected.length ? selected : [approved[0].id])
          }
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
            !usingAll
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Pick specific sets
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {usingAll
          ? `Draws from all ${approved.length} approved set${
              approved.length === 1 ? "" : "s"
            }. Right for a single brand — pick specific sets once two brands should not share imagery.`
          : `${selected.length} of ${approved.length} set${
              approved.length === 1 ? "" : "s"
            } picked. Only these are used, so this brand keeps its own look.`}
      </p>

      <div
        className={cn(
          "grid grid-cols-4 gap-2 sm:grid-cols-6",
          usingAll && "pointer-events-none opacity-40",
        )}
        aria-hidden={usingAll}
      >
        {approved.map((asset) => {
          const isChosen = chosen.has(asset.id);
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => toggle(asset.id)}
              aria-pressed={isChosen}
              tabIndex={usingAll ? -1 : 0}
              title={`${asset.name} · ${asset.images.length} photo${
                asset.images.length === 1 ? "" : "s"
              }`}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-md border-2 transition-colors",
                isChosen
                  ? "border-primary"
                  : "border-transparent hover:border-border-4",
              )}
            >
              <img
                src={asset.images[0]?.url}
                alt={asset.name}
                loading="lazy"
                className={cn(
                  "h-full w-full object-cover transition-opacity",
                  !isChosen && "opacity-70 group-hover:opacity-100",
                )}
              />
              {asset.images.length > 1 && (
                <span className="absolute bottom-1 left-1 rounded bg-overlay/80 px-1 text-[9px] font-bold text-foreground">
                  {asset.images.length}
                </span>
              )}
              {isChosen && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
