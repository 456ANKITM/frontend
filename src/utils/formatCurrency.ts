// The symbol follows the business settings. It starts as "Rs" and is changed by the Settings page.
// TODO(integration): read the currency from GET /api/v1/settings/business when the app loads
// (for example into a context or store), instead of this module-level variable.
let symbol = "Rs";

export const setCurrencySymbol = (next: string) => {
  symbol = next;
};

const full = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const formatCurrency = (n: number) => `${symbol} ${full.format(Math.round(n))}`;

// Short form for chart axes and tight spaces: 1.2L, 3.4Cr, 45K
export function formatCompact(n: number): string {
  const a = Math.abs(n);
  const t = (v: number, s: string) => `${parseFloat(v.toFixed(1))}${s}`;
  if (a >= 1e7) return t(n / 1e7, "Cr");
  if (a >= 1e5) return t(n / 1e5, "L");
  if (a >= 1e3) return t(n / 1e3, "K");
  return String(Math.round(n));
}

export const formatCompactCurrency = (n: number) => `${symbol} ${formatCompact(n)}`;

// Percent change from previous to current; null when there is nothing to compare against.
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}