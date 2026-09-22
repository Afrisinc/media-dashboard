import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccountGroups } from "@/hooks/useAccountGroups";
import { useCreateStory } from "@/hooks/useStoryAgent";
import type { StoryBrief } from "@/types/story";
import { BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";

const GENRES = [
  "Mystery",
  "Sci-Fi",
  "Fantasy",
  "Thriller",
  "Romance",
  "Comedy",
  "Drama",
  "Horror",
  "Adventure",
  "Kids",
];

const AUDIENCES = ["General", "Children", "Young adults", "Adult", "All ages"];

const TONES = [
  "Atmospheric, slow-burn",
  "Fast-paced, punchy",
  "Warm, heartfelt",
  "Dark, suspenseful",
  "Light, comedic",
  "Epic, sweeping",
];

const CUSTOM = "custom";

function PresetField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [customMode, setCustomMode] = useState(
    value !== "" && !options.includes(value),
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={customMode ? CUSTOM : value || undefined}
        onValueChange={(next) => {
          if (next === CUSTOM) {
            setCustomMode(true);
            onChange("");
          } else {
            setCustomMode(false);
            onChange(next);
          }
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM}>Custom…</SelectItem>
        </SelectContent>
      </Select>
      {customMode && (
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={120}
          autoFocus
        />
      )}
    </div>
  );
}

export function StoryBriefForm() {
  const create = useCreateStory();
  const { data: groups } = useAccountGroups();
  const [title, setTitle] = useState("");
  const [premise, setPremise] = useState("");
  const [genre, setGenre] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [autoPromote, setAutoPromote] = useState(false);
  const [autoApprovePromotion, setAutoApprovePromotion] = useState(false);

  const selectedGroup = (groups ?? []).find((group) => group.id === groupId);
  const canSubmit = title.trim().length >= 3 && premise.trim().length >= 20;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || create.isPending) return;

    const brief: StoryBrief = { title: title.trim(), premise: premise.trim() };
    if (genre.trim()) brief.genre = genre.trim();
    if (audience.trim()) brief.audience = audience.trim();
    if (tone.trim()) brief.tone = tone.trim();
    if (groupId) brief.groupId = groupId;
    brief.autoPromote = autoPromote;
    brief.autoApprovePromotion = autoPromote && autoApprovePromotion;

    create.mutate(brief, {
      onSuccess: () => {
        setTitle("");
        setPremise("");
        setGenre("");
        setAudience("");
        setTone("");
        setGroupId("");
        setAutoPromote(false);
        setAutoApprovePromotion(false);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          New story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="story-title">Title</Label>
            <Input
              id="story-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Static"
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-premise">Premise</Label>
            <Textarea
              id="story-premise"
              value={premise}
              onChange={(event) => setPremise(event.target.value)}
              placeholder="A radio operator on a dying station starts hearing a voice from a channel that went dark decades ago."
              maxLength={4000}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              This is what every episode gets written from — the more specific,
              the more consistent the series stays. At least 20 characters.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PresetField
              id="story-genre"
              label="Genre"
              options={GENRES}
              value={genre}
              onChange={setGenre}
              placeholder="Mystery"
            />
            <PresetField
              id="story-audience"
              label="Audience"
              options={AUDIENCES}
              value={audience}
              onChange={setAudience}
              placeholder="Young adults"
            />
            <PresetField
              id="story-tone"
              label="Tone"
              options={TONES}
              value={tone}
              onChange={setTone}
              placeholder="Atmospheric, slow-burn"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="story-brand">Advertise on</Label>
            <Select
              value={groupId || "default"}
              onValueChange={(value) =>
                setGroupId(value === "default" ? "" : value)
              }
            >
              <SelectTrigger id="story-brand">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default brand</SelectItem>
                {(groups ?? []).map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} · {group.activeMemberCount} live page
                    {group.activeMemberCount === 1 ? "" : "s"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedGroup
                ? selectedGroup.activeMemberCount === 0
                  ? "No page in this brand is switched on — nothing would publish."
                  : `Goes out on ${selectedGroup.platforms.join(", ")}.`
                : "Uses whichever brand is set as default."}{" "}
              <Link
                to="/brands"
                className="font-semibold text-primary hover:underline"
              >
                Manage brands
              </Link>
            </p>
          </div>

          <div className="space-y-3 rounded-md border border-border/50 p-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="story-auto-promote"
                checked={autoPromote}
                onCheckedChange={(checked) => setAutoPromote(checked === true)}
              />
              <div>
                <Label htmlFor="story-auto-promote" className="font-normal">
                  Advertise every published episode automatically
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hands the episode to the post agent for a promo post on the
                  brand above.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 pl-6">
              <Checkbox
                id="story-auto-approve-promotion"
                checked={autoApprovePromotion}
                disabled={!autoPromote}
                onCheckedChange={(checked) =>
                  setAutoApprovePromotion(checked === true)
                }
              />
              <div>
                <Label
                  htmlFor="story-auto-approve-promotion"
                  className="font-normal peer-disabled:opacity-50"
                >
                  Publish the promo post without review
                </Label>
                <p className="text-xs text-muted-foreground">
                  Otherwise it lands in Post Studio's review queue like any
                  other draft.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-xs text-muted-foreground">
              Only the title and premise are required. You generate episode one
              after the story is created.
            </p>
            <Button
              type="submit"
              className="w-full sm:w-auto sm:shrink-0"
              disabled={!canSubmit || create.isPending}
            >
              {create.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {create.isPending ? "Creating…" : "Create story"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
