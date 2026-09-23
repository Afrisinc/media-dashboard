import { StatStrip, type StripStat } from "@/components/dashboard/StatStrip";
import {
  StoriesPanel,
  type StoryFilter,
} from "@/components/dashboard/StoriesPanel";
import { StoryBriefForm } from "@/components/dashboard/StoryBriefForm";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useStories } from "@/hooks/useStoryAgent";
import {
  BookOpen,
  CheckCircle2,
  PenLine,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const Stories = () => {
  const all = useStories({ page: 1, limit: 12 });
  const active = useStories({ status: "ACTIVE", page: 1, limit: 12 });
  const completed = useStories({ status: "COMPLETED", page: 1, limit: 12 });
  const drafts = useStories({ status: "DRAFT", page: 1, limit: 12 });
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState<StoryFilter>("all");

  useEffect(() => {
    if (!composing) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setComposing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composing]);

  const openComposer = () => {
    setComposing(true);
    requestAnimationFrame(() =>
      document
        .getElementById("story-composer")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const count = (query: typeof all) => query.data?.total ?? 0;
  const activeCount = count(active);
  const draftCount = count(drafts);

  const stats: StripStat[] = [
    {
      label: "Stories",
      value: String(count(all)),
      icon: BookOpen,
      hint: "Every series you've started",
      onSelect: () => setFilter("all"),
    },
    {
      label: "Active",
      value: String(activeCount),
      icon: Sparkles,
      tone: activeCount > 0 ? "success" : "default",
      hint: activeCount > 0 ? "Taking new episodes" : "None in progress",
      onSelect: () => setFilter("ACTIVE"),
    },
    {
      label: "Completed",
      value: String(count(completed)),
      icon: CheckCircle2,
      hint: "Finished series",
      onSelect: () => setFilter("COMPLETED"),
    },
    {
      label: "Drafts",
      value: String(draftCount),
      icon: PenLine,
      tone: draftCount > 0 ? "attention" : "default",
      hint: draftCount > 0 ? "Waiting for a first episode" : "Nothing waiting",
      onSelect: () => setFilter("DRAFT"),
    },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <PageHeader
        title="Story Studio"
        subtitle="Brief a series once, then generate it episode by episode — chatgpt writes, claude and ollama back it up."
        action={
          <Button
            onClick={() => (composing ? setComposing(false) : openComposer())}
            variant={composing ? "outline" : "default"}
            aria-expanded={composing}
            aria-controls="story-composer"
          >
            {composing ? (
              <>
                <X className="mr-1.5 h-4 w-4" />
                Close
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" />
                New story
              </>
            )}
          </Button>
        }
      />

      <StatStrip
        variant="tiles"
        stats={stats}
        loading={
          all.isLoading ||
          active.isLoading ||
          completed.isLoading ||
          drafts.isLoading
        }
      />

      {composing && (
        <div id="story-composer" className="scroll-mt-4 animate-fade-up">
          <StoryBriefForm />
        </div>
      )}

      <StoriesPanel
        status={filter}
        onStatusChange={setFilter}
        onCreate={openComposer}
        showCreateButton={false}
      />
    </div>
  );
};

export default Stories;
