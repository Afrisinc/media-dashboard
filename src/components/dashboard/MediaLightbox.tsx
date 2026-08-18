import { useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaLightboxProps {
  images: string[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}

export const MediaLightbox = ({
  images,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: MediaLightboxProps) => {
  const total = images.length;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));

  useEffect(() => {
    if (!open || total < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        onIndexChange(safeIndex === 0 ? total - 1 : safeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        onIndexChange(safeIndex === total - 1 ? 0 : safeIndex + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, total, safeIndex, onIndexChange]);

  if (total === 0) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onClick={() => onOpenChange(false)}
        >
          <DialogPrimitive.Title className="sr-only">
            Image {safeIndex + 1} of {total}
          </DialogPrimitive.Title>

          <img
            src={images[safeIndex]}
            alt={`Slide ${safeIndex + 1}`}
            className="max-h-[90vh] max-w-[92vw] object-contain rounded-lg shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />

          <DialogPrimitive.Close
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </DialogPrimitive.Close>

          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  onIndexChange(safeIndex === 0 ? total - 1 : safeIndex - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  onIndexChange(safeIndex === total - 1 ? 0 : safeIndex + 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {images.map((url, idx) => (
                  <button
                    key={`${idx}-${url.slice(0, 16)}`}
                    type="button"
                    aria-label={`Go to image ${idx + 1}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onIndexChange(idx);
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      idx === safeIndex ? "bg-white" : "bg-white/40",
                    )}
                  />
                ))}
              </div>
            </>
          )}

          <span className="absolute bottom-6 right-6 text-xs text-white/70">
            {safeIndex + 1} / {total}
          </span>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
