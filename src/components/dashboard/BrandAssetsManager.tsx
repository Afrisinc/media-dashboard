import { BrandAssetCard } from "@/components/dashboard/BrandAssetCard";
import { BulkAddAssetsDialog } from "@/components/dashboard/BulkAddAssetsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrandAssets } from "@/hooks/useBrandAssets";
import { ImageOff, Plus, ServerCrash } from "lucide-react";
import { useState } from "react";

export function BrandAssetsManager() {
  const { data: assets = [], isLoading, isError } = useBrandAssets();
  const [adding, setAdding] = useState(false);

  const approvedCount = assets.filter((asset) => asset.approved).length;
  const photographs = assets.reduce(
    (total, asset) => total + asset.images.length,
    0,
  );

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-[220px] flex-1">
              <p className="text-sm font-bold">Brand Assets</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {approvedCount} of {assets.length} set
                {assets.length === 1 ? "" : "s"} approved · {photographs}{" "}
                photograph
                {photographs === 1 ? "" : "s"} · the agents rotate through them,
                least recently used first
              </p>
            </div>
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add asset
            </Button>
          </div>

          {isError && (
            <EmptyState
              icon={ServerCrash}
              title="Could not load the library"
              description="content-service is not answering. Check that it is running, then reload."
            />
          )}

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {!isLoading && !isError && assets.length === 0 && (
            <EmptyState
              icon={ImageOff}
              title="No brand assets yet"
              description="A set of photographs is what stops every post looking the same. Add one to get started."
            />
          )}

          {assets.length > 0 && (
            <div className="space-y-3">
              {assets.map((asset) => (
                <BrandAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BulkAddAssetsDialog open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
