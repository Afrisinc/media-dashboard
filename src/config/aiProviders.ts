import type { IconType } from "react-icons";
import { RiOpenaiFill } from "react-icons/ri";
import { SiClaude } from "react-icons/si";
import type { IconBoxTone } from "@/components/ui/icon-box";
import type { AiProviderKey, AiPurposeKey } from "@/types/aiProviderConfig";

export interface AiModelOption {
  value: string;
  label: string;
  hint: string;
}

export interface AiProviderCatalogEntry {
  displayName: string;
  icon: IconType;
  tone: IconBoxTone;
  iconClassName?: string;
  keyPlaceholder: string;
  keyUrl: string;
  keyUrlLabel: string;
  models: Record<AiPurposeKey, AiModelOption[]>;
  supportsOrganization: boolean;
}

export interface AiProviderSlot {
  provider: AiProviderKey;
  purpose: AiPurposeKey;
  title: string;
  description: string;
}

const CLAUDE_MODELS: AiModelOption[] = [
  {
    value: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    hint: "Balanced quality and speed · $3 in / $15 out per 1M tokens",
  },
  {
    value: "claude-haiku-4-5",
    label: "Claude Haiku 4.5",
    hint: "Fastest and cheapest · $1 in / $5 out per 1M tokens",
  },
  {
    value: "claude-opus-5",
    label: "Claude Opus 5",
    hint: "Most capable · $5 in / $25 out per 1M tokens",
  },
  {
    value: "claude-fable-5",
    label: "Claude Fable 5",
    hint: "Frontier model · $10 in / $50 out per 1M tokens",
  },
];

const OPENAI_TEXT_MODELS: AiModelOption[] = [
  {
    value: "gpt-4o",
    label: "GPT-4o",
    hint: "Balanced quality and speed · $2.50 in / $10 out per 1M tokens",
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o mini",
    hint: "Fastest and cheapest · $0.15 in / $0.60 out per 1M tokens",
  },
  {
    value: "gpt-4.1",
    label: "GPT-4.1",
    hint: "Long context, strong writing · $2 in / $8 out per 1M tokens",
  },
  {
    value: "gpt-4.1-mini",
    label: "GPT-4.1 mini",
    hint: "Low cost, long context · $0.40 in / $1.60 out per 1M tokens",
  },
  {
    value: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    hint: "Previous generation · $10 in / $30 out per 1M tokens",
  },
];

const OPENAI_IMAGE_MODELS: AiModelOption[] = [
  {
    value: "dall-e-3",
    label: "DALL·E 3",
    hint: "Article covers and illustrations",
  },
];

export const AI_PROVIDER_CATALOG: Record<
  AiProviderKey,
  AiProviderCatalogEntry
> = {
  anthropic: {
    displayName: "Claude",
    icon: SiClaude,
    tone: "terra",
    keyPlaceholder: "sk-ant-…",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyUrlLabel: "Anthropic Console",
    models: { text: CLAUDE_MODELS, summary: CLAUDE_MODELS, image: [] },
    supportsOrganization: false,
  },
  openai: {
    displayName: "ChatGPT",
    icon: RiOpenaiFill,
    tone: "muted",
    iconClassName: "text-foreground",
    keyPlaceholder: "sk-…",
    keyUrl: "https://platform.openai.com/api-keys",
    keyUrlLabel: "OpenAI dashboard",
    models: {
      text: OPENAI_TEXT_MODELS,
      summary: OPENAI_TEXT_MODELS,
      image: OPENAI_IMAGE_MODELS,
    },
    supportsOrganization: true,
  },
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
