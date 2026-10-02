import type { IconType } from "react-icons";
import { RiOpenaiFill } from "react-icons/ri";
import { SiClaude } from "react-icons/si";
import type { IconBoxTone } from "@/components/ui/icon-box";
import type { AiProviderKey, AiPurposeKey } from "@/types/aiProviderConfig";

export interface AiProviderCatalogEntry {
  displayName: string;
  icon: IconType;
  tone: IconBoxTone;
  iconClassName?: string;
  keyPlaceholder: string;
  modelPlaceholder: Record<AiPurposeKey, string>;
  supportsOrganization: boolean;
}

export interface AiProviderSlot {
  provider: AiProviderKey;
  purpose: AiPurposeKey;
  title: string;
  description: string;
}

export const AI_PROVIDER_CATALOG: Record<
  AiProviderKey,
  AiProviderCatalogEntry
> = {
  anthropic: {
    displayName: "Claude",
    icon: SiClaude,
    tone: "terra",
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
    icon: RiOpenaiFill,
    tone: "muted",
    iconClassName: "text-foreground",
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
  },
  {
    provider: "anthropic",
    purpose: "summary",
    title: "Claude · Summaries",
    description: "Compresses long conversations. Falls back to the text key.",
  },
  {
    provider: "openai",
    purpose: "text",
    title: "ChatGPT · Text",
    description: "News articles and the daily newsletter digest.",
  },
  {
    provider: "openai",
    purpose: "image",
    title: "ChatGPT · Images",
    description: "Article cover images. Falls back to the text key.",
  },
];
