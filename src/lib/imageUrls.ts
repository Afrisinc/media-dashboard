/**
 * Image URLs pasted as free text — one per line, or separated by commas or
 * whitespace. Anything that is not an http(s) URL is dropped, and duplicates
 * are collapsed so pasting the same link twice adds one photograph.
 */
export function parseUrls(raw: string): string[] {
  const seen = new Set<string>();

  return raw
    .split(/[\n,\s]+/)
    .map((line) => line.trim())
    .filter((line) => /^https?:\/\/\S+$/i.test(line))
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}
