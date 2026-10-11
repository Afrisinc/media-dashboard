import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Loader2,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useGenerateNewsSocial } from "@/hooks/useNewsDesk";
import {
  NEWS_SOCIAL_FORMAT_LABELS,
  type NewsSocialFormat,
} from "@/types/newsDesk";

const FORMAT_OPTIONS = (
  Object.keys(NEWS_SOCIAL_FORMAT_LABELS) as NewsSocialFormat[]
).map((value) => ({ value, label: NEWS_SOCIAL_FORMAT_LABELS[value] }));

interface NewsSocialPanelProps {
  articleId: string;
}

export function NewsSocialPanel({ articleId }: Readonly<NewsSocialPanelProps>) {
  const [format, setFormat] = useState<NewsSocialFormat>("story");
  const generate = useGenerateNewsSocial();
  const drafted = generate.data;

  return (
    <section
      aria-label="Create a social post"
      className="space-y-3 rounded-lg border border-border bg-inset p-4"
    >
      <div className="flex items-start gap-3">
        <IconBox icon={Smartphone} tone="primary" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold">Share as a social post</h3>
          <p className="text-xs text-muted-foreground">
            Designs a branded post from this article's cover and headline, then
            sends it to your review queue. Regenerate for a fresh design.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          options={FORMAT_OPTIONS}
          value={format}
          onChange={setFormat}
          disabled={generate.isPending}
        />
        <Button
          size="sm"
          disabled={generate.isPending}
          onClick={() => generate.mutate({ id: articleId, format })}
        >
          {generate.isPending && (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          )}
          {!generate.isPending && drafted && (
            <RefreshCw className="mr-1.5 h-4 w-4" />
          )}
          {generate.isPending
            ? "Designing…"
            : drafted
              ? "Regenerate"
              : "Generate post"}
        </Button>
      </div>

      {drafted && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-emerald/10 px-3 py-2 text-xs text-emerald"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Check className="h-4 w-4" />
            Drafted for {drafted.groupName}
          </span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            asChild
          >
            <Link to="/studio">
              Review in Studio
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
