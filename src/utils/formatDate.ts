// Fixed locale + UTC so server and client render the same text (no hydration mismatch).
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}