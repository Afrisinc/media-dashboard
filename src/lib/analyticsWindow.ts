const DAY_MS = 86400000;

export function windowStartDate(days: number, now: Date = new Date()): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString().slice(0, 10);
}

export function windowStartInstant(
  days: number,
  now: Date = new Date(),
): string {
  return `${windowStartDate(days, now)}T00:00:00.000Z`;
}

export function percent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
