// TODO(integration): read the currency from the business settings (PATCH /settings/business).
const CURRENCY = "Rs";

const full = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const formatCurrency = (n: number) => `${CURRENCY} ${full.format(Math.round(n))}`;

// Short form for chart axes and tight spaces: 1.2L, 3.4Cr, 45K
export function formatCompact(n: number): string {
  const a = Math.abs(n);
  const t = (v: number, s: string) => `${parseFloat(v.toFixed(1))}${s}`;
  if (a >= 1e7) return t(n / 1e7, "Cr");
  if (a >= 1e5) return t(n / 1e5, "L");
  if (a >= 1e3) return t(n / 1e3, "K");
  return String(Math.round(n));
}

export const formatCompactCurrency = (n: number) => `${CURRENCY} ${formatCompact(n)}`;

// Percent change from previous to current; null when there is nothing to compare against.
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}