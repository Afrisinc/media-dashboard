import { useToast } from "@/hooks/use-toast";
import {
  addImagesToAsset,
  approveBrandAsset,
  deleteBrandAsset,
  describeError,
  listBrandAssets,
  removeImageFromAsset,
  updateBrandAsset,
  type BrandAsset,
} from "@/services/brandAssetService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const brandAssetKeys = {
  all: ["brandAssets"] as const,
};

export function useBrandAssets() {
  return useQuery({
    queryKey: brandAssetKeys.all,
    queryFn: listBrandAssets,
  });
}

function useAssetMutation<TArgs>(
  run: (args: TArgs) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandAssetKeys.all });
      toast({ title: successMessage });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

export function useUpdateBrandAsset() {
  return useAssetMutation(
    ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; description?: string };
    }) => updateBrandAsset(id, payload),
    "Set updated",
  );
}

export function useApproveBrandAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      approveBrandAsset(id, approved),
    onSuccess: (asset: BrandAsset) => {
      queryClient.invalidateQueries({ queryKey: brandAssetKeys.all });
      toast({
        title: asset.approved
          ? `“${asset.name}” approved — the agents can use it`
          : `“${asset.name}” held back`,
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

export function useDeleteBrandAsset() {
  return useAssetMutation((id: string) => deleteBrandAsset(id), "Set deleted");
}

export function useAddImagesToAsset() {
  return useAssetMutation(
    ({
      id,
      images,
    }: {
      id: string;
      images: Array<{ url: string; subjects?: string[] }>;
    }) => addImagesToAsset(id, images),
    "Photographs added",
  );
}

export function useRemoveImageFromAsset() {
  return useAssetMutation(
    ({ id, imageId }: { id: string; imageId: string }) =>
      removeImageFromAsset(id, imageId),
    "Photograph removed",
  );
}
