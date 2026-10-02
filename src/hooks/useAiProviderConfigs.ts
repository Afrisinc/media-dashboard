import { useToast } from "@/hooks/use-toast";
import {
  listAiProviderConfigs,
  saveAiProviderConfig,
} from "@/services/aiProviderConfigService";
import { describeError } from "@/services/postAgentService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const aiProviderConfigKeys = {
  all: ["ai-provider-configs"] as const,
};

export function useAiProviderConfigs(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: aiProviderConfigKeys.all,
    queryFn: listAiProviderConfigs,
    enabled: options.enabled ?? true,
    staleTime: 1000 * 30,
  });
}

export function useSaveAiProviderConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: saveAiProviderConfig,
    onSuccess: (config) => {
      queryClient.invalidateQueries({ queryKey: aiProviderConfigKeys.all });
      toast({ title: `${config.provider} ${config.purpose} settings saved` });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: describeError(error) });
    },
  });
}
