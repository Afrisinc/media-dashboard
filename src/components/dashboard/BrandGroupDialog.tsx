import { BrandAssetPicker } from "@/components/dashboard/BrandAssetPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateAccountGroup,
  useUpdateAccountGroup,
} from "@/hooks/useAccountGroups";
import { cn } from "@/lib/utils";
import {
  GROUP_COLORS,
  GROUP_COLOR_TONE,
  WEEKDAY_LABELS,
  type AccountGroup,
  type GroupColor,
  FRAME_CHOICES,
  HOUSE_FRAMES,
} from "@/types/accountGroup";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

const FORMATS = [
  { value: "post", label: "Carousel" },
  { value: "single", label: "Single frame" },
  { value: "story", label: "Story" },
];

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

interface BrandGroupDialogProps {
  open: boolean;
  /** Omit to create a new brand; pass a group to edit it in place. */
  group?: AccountGroup | null;
  onClose: () => void;
}

interface FormState {
  assetIds: string[];
  slideCount: string;
  name: string;
  description: string;
  color: GroupColor;
  topics: string;
  serviceLine: string;
  audience: string;
  defaultFormat: string;
  autopilotEnabled: boolean;
  weekdays: number[];
  slotHour: number;
  postsPerRun: number;
}

const BLANK: FormState = {
  assetIds: [],
  slideCount: "",
  name: "",
  description: "",
  color: "primary",
  topics: "",
  serviceLine: "",
  audience: "",
  defaultFormat: "post",
  autopilotEnabled: false,
  weekdays: [2, 5],
  slotHour: 9,
  postsPerRun: 1,
};

function parseWeekdays(raw: string): number[] {
  return raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
}

function toFormState(group: AccountGroup): FormState {
  return {
    // Editing an existing brand manages photographs on its own card, so the
    // picker starts empty rather than pretending to know the current library.
    assetIds: [],
    slideCount: group.slideCount ? String(group.slideCount) : "",
    name: group.name,
    description: group.description ?? "",
    color: (group.color as GroupColor) ?? "primary",
    topics: group.topics.join("\n"),
    serviceLine: group.serviceLine ?? "",
    audience: group.audience ?? "",
    defaultFormat: group.defaultFormat,
    autopilotEnabled: group.autopilotEnabled,
    weekdays: parseWeekdays(group.slotWeekdays),
    slotHour: group.slotHour,
    postsPerRun: group.postsPerRun,
  };
}

export function BrandGroupDialog({
  open,
  group,
  onClose,
}: BrandGroupDialogProps) {
  const create = useCreateAccountGroup();
  const update = useUpdateAccountGroup();
  const [form, setForm] = useState<FormState>(BLANK);

  useEffect(() => {
    if (open) {
      setForm(group ? toFormState(group) : BLANK);
    }
  }, [open, group]);

  const isSaving = create.isPending || update.isPending;
  const canSave =
    form.name.trim().length >= 2 && form.weekdays.length > 0 && !isSaving;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleWeekday = (day: number) =>
    setForm((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((value) => value !== day)
        : [...current.weekdays, day].sort(),
    }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      color: form.color,
      topics: form.topics
        .split("\n")
        .map((topic) => topic.trim())
        .filter((topic) => topic.length >= 3),
      serviceLine: form.serviceLine.trim(),
      audience: form.audience.trim(),
      defaultFormat: form.defaultFormat,
      // Empty means the house length, which the copy agent already falls back to.
      slideCount: form.slideCount ? Number(form.slideCount) : null,
      autopilotEnabled: form.autopilotEnabled,
      slotWeekdays: form.weekdays.join(","),
      slotHour: form.slotHour,
      postsPerRun: form.postsPerRun,
    };

    if (group) {
      update.mutate({ id: group.id, payload }, { onSuccess: onClose });
      return;
    }
    create.mutate(
      { ...payload, assetIds: form.assetIds },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {group ? `Edit ${group.name}` : "New brand"}
          </DialogTitle>
          <DialogDescription>
            A brand holds the pages it publishes to and the cadence its agents
            work on.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="AFRISINC"
              maxLength={80}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Input
              id="group-description"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Main brand — engineering and design"
              maxLength={280}
            />
          </div>

          <div className="space-y-2">
            <Label>Accent</Label>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use the ${color} accent`}
                  aria-pressed={form.color === color}
                  onClick={() => set("color", color)}
                  className={cn(
                    "h-8 w-8 rounded-lg border-2 transition-colors",
                    GROUP_COLOR_TONE[color],
                    form.color === color
                      ? "border-foreground"
                      : "border-transparent",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-inset p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold">
                  Let the agents run this brand
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  On the cadence below, the agents draft, render and queue a
                  post for every switched-on page here.
                </p>
              </div>
              <Switch
                checked={form.autopilotEnabled}
                onCheckedChange={(value) => set("autopilotEnabled", value)}
                aria-label="Let the agents run this brand"
              />
            </div>

            <div className="space-y-2">
              <Label>Posting days</Label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAY_LABELS.map((label, day) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={form.weekdays.includes(day)}
                    onClick={() => toggleWeekday(day)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors",
                      form.weekdays.includes(day)
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-background text-dim-5 hover:bg-inset-2",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {form.weekdays.length === 0 && (
                <p className="text-xs text-destructive">
                  Pick at least one posting day.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="group-hour">Time</Label>
                <Select
                  value={String(form.slotHour)}
                  onValueChange={(value) => set("slotHour", Number(value))}
                >
                  <SelectTrigger id="group-hour">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((hour) => (
                      <SelectItem key={hour} value={String(hour)}>
                        {String(hour).padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-per-run">Posts per run</Label>
                <Select
                  value={String(form.postsPerRun)}
                  onValueChange={(value) => set("postsPerRun", Number(value))}
                >
                  <SelectTrigger id="group-per-run">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-frames">Frames</Label>
                <Select
                  value={form.slideCount || "house"}
                  onValueChange={(value) =>
                    set("slideCount", value === "house" ? "" : value)
                  }
                  disabled={form.defaultFormat === "single"}
                >
                  <SelectTrigger id="group-frames">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">
                      House length ({HOUSE_FRAMES[form.defaultFormat] ?? 5})
                    </SelectItem>
                    {(FRAME_CHOICES[form.defaultFormat] ?? []).map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count} {count === 1 ? "frame" : "frames"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-format">Format</Label>
                <Select
                  value={form.defaultFormat}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      defaultFormat: value,
                      // Ten frames means nothing to a story, so reset to the
                      // house length rather than carrying an illegal count over.
                      slideCount: "",
                    }))
                  }
                >
                  <SelectTrigger id="group-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {!group && (
            <div className="space-y-2">
              <Label>Photographs</Label>
              <BrandAssetPicker
                selected={form.assetIds}
                onChange={(assetIds) => set("assetIds", assetIds)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="group-topics">Topics the agents write about</Label>
            <Textarea
              id="group-topics"
              value={form.topics}
              onChange={(event) => set("topics", event.target.value)}
              placeholder={
                "One per line\nBoard-level laptop repair for schools\nWhy uptime beats warranty"
              }
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              One per line. The agents work through them without repeating
              themselves. A brand with no topics is skipped rather than guessed
              at.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="group-service-line">Service line</Label>
              <Input
                id="group-service-line"
                value={form.serviceLine}
                onChange={(event) => set("serviceLine", event.target.value)}
                placeholder="Sales & repair"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-audience">Audience</Label>
              <Input
                id="group-audience"
                value={form.audience}
                onChange={(event) => set("audience", event.target.value)}
                placeholder="School administrators"
                maxLength={120}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {group ? "Save changes" : "Create brand"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
