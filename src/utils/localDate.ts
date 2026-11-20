// Dates in the Purchases UI are plain calendar days ("YYYY-MM-DD") in the viewer's local time.
const pad = (n: number) => String(n).padStart(2, "0");

export function toLocalDay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const todayLocal = () => toLocalDay(new Date());

export function daysAgoLocal(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toLocalDay(d);
}

export const currentMonthLocal = () => todayLocal().slice(0, 7); // "YYYY-MM"

// "2026-11-03" -> "Nov 3, 2026" (no timezone shifting, it is a calendar day)
export function formatDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}