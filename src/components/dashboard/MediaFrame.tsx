import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

interface MediaFrameProps {
  src: string;
  alt: string;
  className?: string;
  onExpand?: () => void;
  children?: ReactNode;
}

export const MediaFrame = ({
  src,
  alt,
  className,
  onExpand,
  children,
}: MediaFrameProps) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-lg bg-muted/40 border border-border/40",
      className,
    )}
  >
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-40"
    />
    <img
      src={src}
      alt={alt}
      className="relative w-full h-full object-contain"
      loading="lazy"
    />
    {onExpand && (
      <button
        type="button"
        onClick={onExpand}
        aria-label={`View ${alt} full screen`}
        className="absolute inset-0 group cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
        <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          <Maximize2 className="w-3 h-3" />
          Full view
        </span>
      </button>
    )}
    {children}
  </div>
);
