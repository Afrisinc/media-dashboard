import type { Story } from "@/types/story";

const COVER_TINTS = [
  "bg-gradient-to-br from-primary/25 to-primary/5",
  "bg-gradient-to-br from-emerald/25 to-emerald/5",
  "bg-gradient-to-br from-indigo/25 to-indigo/5",
  "bg-gradient-to-br from-gold/25 to-gold/5",
  "bg-gradient-to-br from-forest/25 to-forest/5",
  "bg-gradient-to-br from-amber/25 to-amber/5",
];

export const coverTint = (story: Story) => {
  const hash = [...story.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COVER_TINTS[hash % COVER_TINTS.length];
};
