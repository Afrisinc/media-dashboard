import { Facebook, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

const platformConfig = {
  facebook: { Icon: Facebook, className: "text-platform-facebook" },
  instagram: { Icon: Instagram, className: "text-platform-instagram" },
} as const;

type Platform = keyof typeof platformConfig | "both";

interface PlatformIconProps {
  platform: Platform;
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
  const { Icon, className: toneClass } = platformConfig[platform];
  return <Icon className={cn("h-4 w-4", toneClass, className)} />;
}
