import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  LayoutList,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const platformConfig: Record<string, { Icon: LucideIcon; className: string }> =
  {
    facebook: { Icon: Facebook, className: "text-platform-facebook" },
    instagram: { Icon: Instagram, className: "text-platform-instagram" },
    linkedin: { Icon: Linkedin, className: "text-platform-linkedin" },
    youtube: { Icon: Youtube, className: "text-platform-youtube" },
    // X has no brand hue of its own — it reads as ink, so it must follow the theme.
    twitter: { Icon: Twitter, className: "text-foreground" },
  };

const fallback = { Icon: LayoutList, className: "text-muted-foreground" };

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  if (platform === "both") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <Facebook className="h-4 w-4 text-platform-facebook" />
        <Instagram className="-ml-1.5 h-4 w-4 text-platform-instagram" />
      </span>
    );
  }

  const { Icon, className: toneClass } = platformConfig[platform] ?? fallback;
  return <Icon className={cn("h-4 w-4", toneClass, className)} />;
}
