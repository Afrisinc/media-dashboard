import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

function normalise(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, " ");
}

export function TagInput({
  id,
  value,
  onChange,
  placeholder = "Add a tag and press Enter",
  maxTags = 30,
  disabled = false,
  className,
}: Readonly<TagInputProps>) {
  const [draft, setDraft] = useState("");
  const full = value.length >= maxTags;

  const commit = (raw: string) => {
    const incoming = raw.split(",").map(normalise).filter(Boolean);
    if (incoming.length === 0) return;
    const next = [...value];
    for (const tag of incoming) {
      if (!next.includes(tag) && next.length < maxTags) next.push(tag);
    }
    onChange(next);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            disabled={disabled}
            aria-label={`Remove ${tag}`}
            className="rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          if (next.includes(",")) commit(next);
          else setDraft(next);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        disabled={disabled || full}
        placeholder={full ? `Up to ${maxTags} tags` : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
