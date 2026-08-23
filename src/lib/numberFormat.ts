const compact = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1_240_000 → "1.2M". Keeps a dense metric row from wrapping. */
export function compactNumber(value: number): string {
  return compact.format(value);
}
