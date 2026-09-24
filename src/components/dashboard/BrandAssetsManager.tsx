import { BrandAssetCard } from "@/components/dashboard/BrandAssetCard";
import { BulkAddAssetsDialog } from "@/components/dashboard/BulkAddAssetsDialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrandAssets } from "@/hooks/useBrandAssets";
import { ImageOff, Images, Plus } from "lucide-react";
import { useState } from "react";

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function BrandAssetsManager() {
  const query = useBrandAssets();
  const assets = query.data ?? [];
  const [adding, setAdding] = useState(false);

  const approvedCount = assets.filter((asset) => asset.approved).length;
  const photographs = assets.reduce(
    (total, asset) => total + asset.images.length,
    0,
  );

  const description =
    assets.length > 0
      ? `${approvedCount} of ${plural(assets.length, "set")} approved · ${plural(photographs, "photograph")} · used least recently first`
      : "Photographs the agents build posts from, so no two posts look the same.";

  return (
    <>
      <SectionCard
        title="Brand assets"
        icon={Images}
        iconTone="primary"
        description={description}
        action={
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5 sm:mr-1.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">Add asset</span>
          </Button>
        }
      >
        {query.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        )}

        {query.isError && (
          <ErrorState
            title="Could not load the library"
            description="content-service is not answering. Check that it is running."
            onRetry={() => query.refetch()}
            retrying={query.isFetching}
          />
        )}

        {!query.isLoading && !query.isError && assets.length === 0 && (
          <EmptyState
            icon={ImageOff}
            title="No brand assets yet"
            description="A set of photographs is what stops every post looking the same. Add one to get started."
            action={
              <Button size="sm" onClick={() => setAdding(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Add your first set
              </Button>
            }
          />
        )}

        {assets.length > 0 && (
          <div className="space-y-3">
            {assets.map((asset) => (
              <BrandAssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </SectionCard>

      <BulkAddAssetsDialog open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
