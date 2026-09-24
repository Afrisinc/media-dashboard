import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutopilot } from "@/contexts/AutopilotContext";
import { cn } from "@/lib/utils";
import { Bot, Check, Hand, Loader2, type LucideIcon } from "lucide-react";

interface ModeOption {
  autopilot: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
}

const MODE_OPTIONS: ModeOption[] = [
  {
    autopilot: false,
    icon: Hand,
    title: "I drive",
    description: "The agents draft. Nothing goes live until you approve it.",
    points: [
      "Drafts wait for you in Post Studio",
      "You choose when each post publishes",
    ],
  },
  {
    autopilot: true,
    icon: Bot,
    title: "Agents drive",
    description:
      "The agents write, schedule and publish to every live page with no approval step.",
    points: [
      "Runs only in the brands you put on autopilot",
      "Each agent can still be switched off on its own",
    ],
  },
];

export function PublishingModeCard() {
  const { autopilot, setAutopilot, isSaving, isLoading } = useAutopilot();

  return (
    <SectionCard
      title="Who publishes"
      icon={autopilot ? Bot : Hand}
      iconTone={autopilot ? "success" : "muted"}
      description="Decide whether posts wait for your approval or go straight out."
      action={
        isSaving ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Saving
          </span>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Who publishes"
          className="grid gap-3 sm:grid-cols-2"
        >
          {MODE_OPTIONS.map((option) => {
            const selected = option.autopilot === autopilot;
            return (
              <button
                key={option.title}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isSaving}
                onClick={() => !selected && setAutopilot(option.autopilot)}
                className={cn(
                  "relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-4 hover:bg-muted/40",
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      selected
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <option.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-sm font-semibold">
                    {option.title}
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border-4",
                    )}
                    aria-hidden
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
                <span className="space-y-1.5">
                  {option.points.map((point) => (
                    <span
                      key={point}
                      className="flex items-start gap-2 text-xs"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-3 w-3 flex-shrink-0",
                          selected ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                      {point}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
