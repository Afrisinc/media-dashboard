import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCEPTED_PHOTO_TYPES,
  type StagedPhoto,
} from "@/hooks/useStagedPhotos";
import { cn } from "@/lib/utils";

interface PhotoDropzoneProps {
  staged: StagedPhoto[];
  onAdd: (files: FileList | null) => void;
  onRemove: (preview: string) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

export function PhotoDropzone({
  staged,
  onAdd,
  onRemove,
  disabled = false,
  title = "Drop photographs here",
  className,
}: Readonly<PhotoDropzoneProps>) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) onAdd(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-inset",
          disabled && "opacity-60",
        )}
      >
        <Upload className="h-5 w-5 text-muted-foreground" aria-hidden />
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or GIF · up to 12MB each
        </p>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED_PHOTO_TYPES}
          multiple
          className="hidden"
          onChange={(event) => {
            onAdd(event.target.files);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-1"
          disabled={disabled}
          onClick={() => input.current?.click()}
        >
          Choose files
        </Button>
      </div>

      {staged.length > 0 && (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {staged.map((item) => (
            <li key={item.preview} className="group relative">
              <img
                src={item.preview}
                alt={item.file.name}
                title={item.file.name}
                className="aspect-square w-full rounded-md border border-border object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-primary px-1 text-[9px] font-bold uppercase text-primary-foreground">
                New
              </span>
              <button
                type="button"
                aria-label={`Remove ${item.file.name}`}
                disabled={disabled}
                onClick={() => onRemove(item.preview)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-overlay/90 text-foreground transition-opacity reveal-on-hover after:absolute after:-inset-1 after:content-['']"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
