const HASHTAG_LINE = /^(\s*#[\p{L}\p{N}_]+[\s,]*)+$/u;

const normalize = (tag: string) => (tag.startsWith("#") ? tag : `#${tag}`);

export function splitTrailingHashtags(
  message: string | null | undefined,
  tags: string[] = [],
) {
  const lines = (message ?? "").split("\n");

  let end = lines.length;
  while (
    end > 0 &&
    (lines[end - 1].trim() === "" || HASHTAG_LINE.test(lines[end - 1]))
  ) {
    end -= 1;
  }

  const trailing =
    lines
      .slice(end)
      .join(" ")
      .match(/#[\p{L}\p{N}_]+/gu) ?? [];

  const seen = new Set<string>();
  const hashtags = [...tags.map(normalize), ...trailing].filter((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { body: lines.slice(0, end).join("\n").trimEnd(), hashtags };
}
