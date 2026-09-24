export function describeCron(expression: string): string {
  const minutes = /^\*\/(\d+) \* \* \* \*$/.exec(expression);
  if (minutes) return `every ${minutes[1]} minutes`;
  const hours = /^0 \*\/(\d+) \* \* \*$/.exec(expression);
  if (hours) return `every ${hours[1]} hours`;
  if (expression === "0 * * * *") return "every hour";
  const hourly = /^(\d+) \* \* \* \*$/.exec(expression);
  if (hourly) return `hourly at :${hourly[1].padStart(2, "0")}`;
  const daily = /^(\d+) (\d+) \* \* \*$/.exec(expression);
  if (daily) {
    return `daily at ${daily[2].padStart(2, "0")}:${daily[1].padStart(2, "0")} UTC`;
  }
  return expression;
}
