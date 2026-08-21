import { useToast } from "@/hooks/use-toast";
import {
  addAccountsToGroup,
  assignGroupAssets,
  listGroupAssets,
  unassignGroupAsset,
  createAccountGroup,
  deleteAccountGroup,
  describeError,
  getGroupTargets,
  listAccountGroups,
  removeAccountFromGroup,
  setGroupAccountActive,
  updateAccountGroup,
} from "@/services/accountGroupService";
import {
  installPageFromFacebook,
  type InstallPageParams,
} from "@/services/socialAccountService";
import type {
  AccountGroup,
  CreateAccountGroupPayload,
  UpdateAccountGroupPayload,
} from "@/types/accountGroup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const accountGroupKeys = {
  all: ["account-groups"] as const,
  targets: (id: string) => ["account-groups", "targets", id] as const,
  assets: (id: string) => ["account-groups", "assets", id] as const,
};

export function useAccountGroups() {
  return useQuery({
    queryKey: accountGroupKeys.all,
    queryFn: listAccountGroups,
    staleTime: 1000 * 30,
  });
}

export function useGroupTargets(groupId: string | undefined) {
  return useQuery({
    queryKey: accountGroupKeys.targets(groupId ?? ""),
    queryFn: () => getGroupTargets(groupId as string),
    enabled: Boolean(groupId),
  });
}

function useGroupMutation<TArgs>(
  run: (args: TArgs) => Promise<AccountGroup>,
  successMessage: (group: AccountGroup) => string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: run,
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: accountGroupKeys.all });
      toast({ title: successMessage(group) });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

export function useCreateAccountGroup() {
  return useGroupMutation(
    (payload: CreateAccountGroupPayload) => createAccountGroup(payload),
    (group) => `${group.name} created`,
  );
}

export function useUpdateAccountGroup() {
  return useGroupMutation(
    ({ id, payload }: { id: string; payload: UpdateAccountGroupPayload }) =>
      updateAccountGroup(id, payload),
    (group) => `${group.name} updated`,
  );
}

export function useAddAccountsToGroup() {
  return useGroupMutation(
    ({ id, accountIds }: { id: string; accountIds: string[] }) =>
      addAccountsToGroup(id, accountIds),
    (group) => `Added to ${group.name}`,
  );
}

export function useRemoveAccountFromGroup() {
  return useGroupMutation(
    ({ id, accountId }: { id: string; accountId: string }) =>
      removeAccountFromGroup(id, accountId),
    (group) => `Removed from ${group.name}`,
  );
}

export function useSetGroupAccountActive() {
  return useGroupMutation(
    ({
      id,
      accountId,
      isActive,
    }: {
      id: string;
      accountId: string;
      isActive: boolean;
    }) => setGroupAccountActive(id, accountId, isActive),
    () => "Account updated",
  );
}

export function useDeleteAccountGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteAccountGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountGroupKeys.all });
      toast({
        title: "Group deleted",
        description: "The connected pages themselves are still installed.",
      });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

export interface AddPagesToBrandParams {
  groupId: string;
  /** Accounts already installed under this login. */
  accountIds: string[];
  /** Pages to install first, then add. */
  install: InstallPageParams[];
}

/**
 * The one action behind "Add pages": install whatever the user picked that was
 * not connected yet, then put everything into the brand in a single step.
 *
 * Installs run sequentially — the API touches the platform per call, and a
 * partial failure must report which page failed rather than a rejected batch.
 */
export function useAddPagesToBrand() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      groupId,
      accountIds,
      install,
    }: AddPagesToBrandParams) => {
      const installed: string[] = [];

      for (const page of install) {
        const account = await installPageFromFacebook(page).catch(
          (error: unknown) => {
            throw new Error(`${page.pageName}: ${describeError(error)}`);
          },
        );
        installed.push(account.id);
      }

      const ids = [...accountIds, ...installed];
      const group = await addAccountsToGroup(groupId, ids);
      return { group, installedCount: installed.length };
    },
    onSuccess: ({ group, installedCount }) => {
      queryClient.invalidateQueries({ queryKey: accountGroupKeys.all });
      queryClient.invalidateQueries({
        queryKey: ["social-media-integrations"],
      });
      toast({
        title: `Added to ${group.name}`,
        description: installedCount
          ? `${installedCount} new page${installedCount === 1 ? "" : "s"} connected along the way.`
          : undefined,
      });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: error.message });
    },
  });
}

/** The photograph sets a brand publishes with. */
export function useGroupAssets(groupId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: accountGroupKeys.assets(groupId ?? ""),
    queryFn: () => listGroupAssets(groupId as string),
    enabled: Boolean(groupId) && enabled,
  });
}

function useGroupAssetMutation<TArgs>(
  run: (args: TArgs) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountGroupKeys.all });
      toast({ title: successMessage });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}

export function useAssignGroupAssets() {
  return useGroupAssetMutation(
    ({ id, assetIds }: { id: string; assetIds: string[] }) =>
      assignGroupAssets(id, assetIds),
    "Photographs added to this brand",
  );
}

export function useUnassignGroupAsset() {
  return useGroupAssetMutation(
    ({ id, assetId }: { id: string; assetId: string }) =>
      unassignGroupAsset(id, assetId),
    "Photographs removed from this brand",
  );
}
