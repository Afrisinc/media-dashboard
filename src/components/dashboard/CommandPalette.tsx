import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const suggestions = [
  {
    kind: "Article",
    text: "Write a deep-dive on mobile money in Ghana and publish to the website + LinkedIn",
  },
  {
    kind: "Video",
    text: "Cut 3 Reels from our latest article and post them Thursday morning",
  },
  {
    kind: "Story",
    text: "A 5-part story series introducing our AI creative team",
  },
  {
    kind: "Podcast",
    text: "Turn this week's roundup into an 18-minute podcast episode",
  },
];

const kinds = ["Article", "Video", "Story", "Podcast", "Post"];
const channels = [
  "Website",
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "X",
  "LinkedIn",
];
const schedules = [
  "Publish now",
  "Best time",
  "Tomorrow 09:00",
  "Thursday 14:00",
  "Weekly series",
];

function chipClass(active: boolean) {
  return cn(
    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold",
    active
      ? "border-primary/55 bg-primary/10 text-foreground"
      : "border-border-2 bg-inset text-muted-foreground",
  );
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [text, setText] = useState("");
  const [selectedKinds, setSelectedKinds] = useState<string[]>(["Article"]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "Website",
    "LinkedIn",
  ]);
  const [when, setWhen] = useState("Best time");
  const [running, setRunning] = useState(false);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    value: string,
  ) => {
    set(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const reset = () => {
    setText("");
    setSelectedKinds(["Article"]);
    setSelectedChannels(["Website", "LinkedIn"]);
    setWhen("Best time");
    setRunning(false);
  };

  const handleRun = () => {
    if (!text.trim() || running) return;
    setRunning(true);
    setTimeout(() => {
      toast.success(
        `${selectedKinds.length} ${selectedKinds.length > 1 ? "briefs" : "brief"} handed to your AI team — ${
          when === "Publish now"
            ? "publishing now"
            : "queued for " + when.toLowerCase()
        }`,
      );
      onOpenChange(false);
      reset();
    }, 1200);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="top-24 max-w-2xl translate-y-0 gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <IconBox icon={Sparkles} tone="primary" size="sm" />
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What should your AI team make? e.g. “Write an article on mobile money in Ghana and cut 3 Reels from it, publish Thursday morning”"
            className="h-14 flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border-3 bg-inset-2 text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-auto px-5 py-4">
          {!text && (
            <div>
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Try one of these
              </p>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => setText(s.text)}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-inset px-3 py-2.5 text-left text-xs font-medium"
                  >
                    <span className="rounded px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase text-primary bg-primary/10">
                      {s.kind}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Make
            </p>
            <div className="flex flex-wrap gap-1.5">
              {kinds.map((kind) => (
                <button
                  key={kind}
                  onClick={() => toggle(selectedKinds, setSelectedKinds, kind)}
                  className={chipClass(selectedKinds.includes(kind))}
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Publish to
            </p>
            <div className="flex flex-wrap gap-1.5">
              {channels.map((channel) => (
                <button
                  key={channel}
                  onClick={() =>
                    toggle(selectedChannels, setSelectedChannels, channel)
                  }
                  className={chipClass(selectedChannels.includes(channel))}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              When
            </p>
            <div className="flex flex-wrap gap-1.5">
              {schedules.map((option) => (
                <button
                  key={option}
                  onClick={() => setWhen(option)}
                  className={chipClass(when === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-3.5">
          <span className="flex-1 text-xs text-muted-foreground">
            {text
              ? `${selectedKinds.length || 1} × ${selectedChannels.length} outputs · ${when}`
              : "Describe it in plain words — or pick a starting point above"}
          </span>
          <Button disabled={!text.trim()} onClick={handleRun}>
            {running ? "Handing off…" : "Create & queue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
