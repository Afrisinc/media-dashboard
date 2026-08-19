import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePostDraft } from "@/hooks/usePostAgent";
import {
  FORMAT_LABELS,
  type PostBrief,
  type PostFormatName,
} from "@/types/postAgent";
import { Loader2, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

const FORMATS: PostFormatName[] = ["post", "single", "story"];

/** The house length. Ask for more only when the topic genuinely needs it. */
const FRAME_CHOICES: Record<PostFormatName, number[]> = {
  post: [4, 5, 6, 7, 8, 9, 10],
  single: [1],
  story: [1, 2, 3],
};

const DEFAULT_FRAMES: Record<PostFormatName, string> = {
  post: "",
  single: "1",
  story: "",
};

export function PostBriefForm() {
  const create = useCreatePostDraft();
  const [format, setFormat] = useState<PostFormatName>("post");
  const [topic, setTopic] = useState("");
  const [offer, setOffer] = useState("");
  const [serviceLine, setServiceLine] = useState("");
  const [audience, setAudience] = useState("");
  const [slideCount, setSlideCount] = useState<string>("");

  const onFormatChange = (next: PostFormatName) => {
    setFormat(next);
    setSlideCount(DEFAULT_FRAMES[next]);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!topic.trim() || create.isPending) return;

    const brief: PostBrief = { topic: topic.trim(), format };
    if (slideCount) brief.slideCount = Number(slideCount);
    if (offer.trim()) brief.offer = offer.trim();
    if (serviceLine.trim()) brief.serviceLine = serviceLine.trim();
    if (audience.trim()) brief.audience = audience.trim();

    create.mutate(brief, {
      onSuccess: () => {
        setTopic("");
        setOffer("");
        setAudience("");
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          New brief
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Board-level laptop repair for schools"
              maxLength={200}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select
                value={format}
                onValueChange={(value) =>
                  onFormatChange(value as PostFormatName)
                }
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {FORMAT_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frames">Frames</Label>
              <Select
                value={slideCount || "auto"}
                onValueChange={(value) =>
                  setSlideCount(value === "auto" ? "" : value)
                }
                disabled={format === "single"}
              >
                <SelectTrigger id="frames">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">House length</SelectItem>
                  {FRAME_CHOICES[format].map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count} {count === 1 ? "frame" : "frames"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="offer">Offer</Label>
              <Input
                id="offer"
                value={offer}
                onChange={(event) => setOffer(event.target.value)}
                placeholder="Free diagnostic"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceLine">Service line</Label>
              <Input
                id="serviceLine"
                value={serviceLine}
                onChange={(event) => setServiceLine(event.target.value)}
                placeholder="Sales & repair"
                maxLength={60}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <Input
              id="audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder="School administrators and office IT managers"
              maxLength={120}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Everything but the topic is optional. The draft lands in review —
              nothing publishes until you approve it.
            </p>
            <Button type="submit" disabled={!topic.trim() || create.isPending}>
              {create.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {create.isPending ? "Drafting…" : "Draft it"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
