import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "h-8 w-8 rounded-lg [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 rounded-lg [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-12 w-12 rounded-xl [&_svg]:h-6 [&_svg]:w-6",
  avatar: "h-12 w-12 rounded-full [&_svg]:h-6 [&_svg]:w-6",
} as const;

const toneClass = {
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-emerald/10 text-emerald",
  destructive: "bg-destructive/10 text-destructive",
  terra: "bg-terra/10 text-terra",
  gold: "bg-gold/10 text-gold",
  amber: "bg-amber/10 text-amber",
} as const;

export type IconBoxTone = keyof typeof toneClass;

interface IconBoxProps {
  icon: LucideIcon;
  size?: keyof typeof sizeClass;
  tone?: IconBoxTone;
  className?: string;
}

export function IconBox({
  icon: Icon,
  size = "md",
  tone = "muted",
  className,
}: IconBoxProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center",
        sizeClass[size],
        toneClass[tone],
        className,
      )}
    >
      <Icon />
    </div>
  );
}
