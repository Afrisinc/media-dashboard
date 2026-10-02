import type { LucideIcon } from "lucide-react";
import { Brain, ImageIcon, ScrollText, Sparkles } from "lucide-react";
import type { IconBoxTone } from "@/components/ui/icon-box";
import type { AiProviderKey, AiPurposeKey } from "@/types/aiProviderConfig";

export interface AiProviderCatalogEntry {
  displayName: string;
  keyPlaceholder: string;
  modelPlaceholder: Record<AiPurposeKey, string>;
  supportsOrganization: boolean;
}

export interface AiProviderSlot {
  provider: AiProviderKey;
  purpose: AiPurposeKey;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: IconBoxTone;
}

export const AI_PROVIDER_CATALOG: Record<
  AiProviderKey,
  AiProviderCatalogEntry
> = {
  anthropic: {
    displayName: "Claude",
    keyPlaceholder: "sk-ant-…",
    modelPlaceholder: {
      text: "claude-sonnet-5-5",
      image: "",
      summary: "claude-haiku-4-5",
    },
    supportsOrganization: false,
  },
  openai: {
    displayName: "ChatGPT",
    keyPlaceholder: "sk-…",
    modelPlaceholder: {
      text: "gpt-4o",
      image: "dall-e-3",
      summary: "gpt-4o-mini",
    },
    supportsOrganization: true,
  },
};

export const AI_PURPOSE_LABELS: Record<AiPurposeKey, string> = {
  text: "Text",
  image: "Images",
  summary: "Summaries",
};

export const AI_PROVIDER_SLOTS: readonly AiProviderSlot[] = [
  {
    provider: "anthropic",
    purpose: "text",
    title: "Claude · Text",
    description: "Stories, post copy and every agent that writes.",
    icon: Brain,
    tone: "terra",
  },
  {
    provider: "anthropic",
    purpose: "summary",
    title: "Claude · Summaries",
    description: "Compresses long conversations. Falls back to the text key.",
    icon: ScrollText,
    tone: "gold",
  },
  {
    provider: "openai",
    purpose: "text",
    title: "ChatGPT · Text",
    description: "News articles and the daily newsletter digest.",
    icon: Sparkles,
    tone: "primary",
  },
  {
    provider: "openai",
    purpose: "image",
    title: "ChatGPT · Images",
    description: "Article cover images. Falls back to the text key.",
    icon: ImageIcon,
    tone: "success",
  },
];
