import type { IconBoxTone } from "@/components/ui/icon-box";
import type { MediaKind } from "@/lib/mediaLibrary";
import {
  BookOpen,
  FileText,
  Images,
  Mic,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface MediaFormat {
  kind: MediaKind;
  icon: LucideIcon;
  tone: IconBoxTone;
  title: string;
  description: string;
  href?: string;
  studio?: string;
}

export const MEDIA_FORMATS: MediaFormat[] = [
  {
    kind: "post",
    icon: Images,
    tone: "primary",
    title: "Social posts",
    description: "Carousels and single images for every connected page.",
    href: "/studio",
    studio: "Post Studio",
  },
  {
    kind: "article",
    icon: FileText,
    tone: "success",
    title: "Articles",
    description:
      "African news rewritten, illustrated and published to the website.",
    href: "/news",
    studio: "News Desk",
  },
  {
    kind: "story",
    icon: BookOpen,
    tone: "gold",
    title: "Stories",
    description: "Episodic fiction, one reviewed episode at a time.",
    href: "/stories",
    studio: "Story Studio",
  },
  {
    kind: "video",
    icon: Video,
    tone: "muted",
    title: "Videos",
    description: "Reels, Shorts and TikTok cuts made from your best articles.",
  },
  {
    kind: "podcast",
    icon: Mic,
    tone: "muted",
    title: "Podcasts",
    description: "Narrated episodes voiced from the week's top stories.",
  },
];
