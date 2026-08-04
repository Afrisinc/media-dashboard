import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface CatalogPlatform {
  name: string;
  short: string;
  tone: string;
  kinds: string;
}

export const catalogPlatforms: CatalogPlatform[] = [
  {
    name: "Threads",
    short: "TH",
    tone: "text-ink-f bg-ink-f/10",
    kinds: "Posts, replies",
  },
  {
    name: "WhatsApp",
    short: "WA",
    tone: "text-platform-whatsapp bg-platform-whatsapp/10",
    kinds: "Status, broadcasts",
  },
  {
    name: "Pinterest",
    short: "PI",
    tone: "text-destructive bg-destructive/10",
    kinds: "Pins, boards",
  },
  {
    name: "Telegram",
    short: "TG",
    tone: "text-primary bg-primary/10",
    kinds: "Channel posts",
  },
  {
    name: "Spotify",
    short: "SP",
    tone: "text-platform-spotify bg-platform-spotify/10",
    kinds: "Podcast episodes",
  },
  {
    name: "Substack",
    short: "SU",
    tone: "text-terra bg-terra/10",
    kinds: "Newsletters",
  },
  {
    name: "Medium",
    short: "ME",
    tone: "text-forest bg-forest/10",
    kinds: "Articles",
  },
  {
    name: "Google Business",
    short: "GB",
    tone: "text-gold bg-gold/10",
    kinds: "Local posts",
  },
];

interface PlatformCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addedNames: string[];
  onSelect: (platform: CatalogPlatform) => void;
}

export function PlatformCatalogDialog({
  open,
  onOpenChange,
  addedNames,
  onSelect,
}: PlatformCatalogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a platform</DialogTitle>
          <DialogDescription>
            Each one becomes a channel your AI team can publish to.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {catalogPlatforms.map((platform) => {
            const added = addedNames.includes(platform.name);
            return (
              <button
                key={platform.name}
                onClick={() => onSelect(platform)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left",
                  added
                    ? "border-emerald/35 bg-inset opacity-70"
                    : "border-border bg-inset",
                )}
              >
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-bold",
                    platform.tone,
                  )}
                >
                  {platform.short}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-bold">
                    {platform.name}
                  </span>
                  <span className="block truncate text-[11px] text-dim-5">
                    {platform.kinds}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex-shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase",
                    added
                      ? "bg-emerald/13 text-emerald"
                      : "bg-primary/12 text-primary",
                  )}
                >
                  {added ? "Added" : "Add"}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11.5px] text-dim-4">
          Every platform supports multiple accounts once connected.
        </p>
      </DialogContent>
    </Dialog>
  );
}
