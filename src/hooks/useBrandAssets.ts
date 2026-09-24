import { useToast } from "@/hooks/use-toast";
import {
  addImagesToAsset,
  approveBrandAsset,
  deleteBrandAsset,
  describeError,
  listBrandAssets,
  removeImageFromAsset,
  updateBrandAsset,
  uploadImagesToAsset,
  type BrandAsset,
  type BrandAssetUpdate,
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
    ({ id, payload }: { id: string; payload: BrandAssetUpdate }) =>
      updateBrandAsset(id, payload),
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

export interface SaveBrandAssetInput {
  id: string;
  changes?: BrandAssetUpdate;
  files?: File[];
  urls?: string[];
  subjects?: string[];
}

export interface SaveBrandAssetResult {
  added: number;
  rejected: string[];
}

export function useSaveBrandAsset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      changes,
      files = [],
      urls = [],
      subjects,
    }: SaveBrandAssetInput): Promise<SaveBrandAssetResult> => {
      const imagesBefore = queryClient
        .getQueryData<BrandAsset[]>(brandAssetKeys.all)
        ?.find((asset) => asset.id === id)?.images.length;

      if (changes && Object.keys(changes).length > 0) {
        await updateBrandAsset(id, changes);
      }

      let uploaded = 0;
      let rejected: string[] = [];
      if (files.length > 0) {
        const upload = await uploadImagesToAsset(id, files, subjects);
        uploaded = upload.added;
        rejected = upload.rejected;
      }

      if (urls.length === 0) {
        return { added: uploaded, rejected };
      }

      const asset = await addImagesToAsset(
        id,
        urls.map((url) => ({ url, subjects })),
      );
      const added =
        imagesBefore === undefined
          ? uploaded + urls.length
          : asset.images.length - imagesBefore;
      return { added, rejected };
    },
    onSuccess: ({ added, rejected }) => {
      queryClient.invalidateQueries({ queryKey: brandAssetKeys.all });
      toast({
        title:
          added > 0
            ? `Set saved · ${added} photograph${added === 1 ? "" : "s"} added`
            : "Set saved",
        description:
          rejected.length > 0
            ? `Skipped ${rejected.length}: ${rejected.join("; ")}`
            : undefined,
      });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: brandAssetKeys.all });
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}
