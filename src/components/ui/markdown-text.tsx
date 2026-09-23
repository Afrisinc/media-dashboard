import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "paragraph"; text: string };

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

function stripHtml(source: string) {
  return source
    .replace(/<h2[^>]*>/gi, "\n\n## ")
    .replace(/<h[3-6][^>]*>/gi, "\n\n### ")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/?(strong|b)>/gi, "**")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|h[1-6]|ul|ol|blockquote)\s*>/gi, "\n\n")
    .replace(/<\/\s*li\s*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  for (const line of stripHtml(source).split("\n")) {
    const trimmed = line.trim();
    const heading = HEADING.exec(trimmed);
    const bullet = BULLET.exec(line);
    const numbered = NUMBERED.exec(line);

    if (!trimmed) {
      flushParagraph();
    } else if (heading) {
      flushParagraph();
      blocks.push({
        kind: "heading",
        level: heading[1].length <= 2 ? 2 : 3,
        text: heading[2],
      });
    } else if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      const text = (bullet ?? numbered)?.[1] ?? "";
      const last = blocks.at(-1);
      if (last?.kind === "list" && last.ordered === ordered) {
        last.items.push(text);
      } else {
        blocks.push({ kind: "list", ordered, items: [text] });
      }
    } else {
      paragraph.push(trimmed);
    }
  }

  flushParagraph();
  return blocks;
}

function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

interface MarkdownTextProps {
  source: string;
  className?: string;
}

export function MarkdownText({ source, className }: MarkdownTextProps) {
  return (
    <div
      className={cn(
        "space-y-4 text-[15px] leading-7 text-foreground/90",
        className,
      )}
    >
      {parse(source).map((block, index) => {
        if (block.kind === "heading") {
          const Heading = block.level === 2 ? "h3" : "h4";
          return (
            <Heading
              key={index}
              className={cn(
                "pt-2 font-semibold leading-snug text-foreground",
                block.level === 2 ? "text-lg" : "text-base",
              )}
            >
              {inline(block.text)}
            </Heading>
          );
        }
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={index}
              className={cn(
                "space-y-1.5 pl-5",
                block.ordered ? "list-decimal" : "list-disc",
              )}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inline(item)}</li>
              ))}
            </List>
          );
        }
        return <p key={index}>{inline(block.text)}</p>;
      })}
    </div>
  );
}
