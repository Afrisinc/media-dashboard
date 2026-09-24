const DAY_MS = 86400000;

export function windowStartDate(days: number, now: Date = new Date()): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString().slice(0, 10);
}

export function windowStartInstant(
  days: number,
  now: Date = new Date(),
): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

export function percent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
