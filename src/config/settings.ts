import type { CurrencyCode } from "@/types/settings";

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "NPR", label: "Nepalese rupee (NPR)", symbol: "Rs" },
  { code: "INR", label: "Indian rupee (INR)", symbol: "\u20B9" },
  { code: "USD", label: "US dollar (USD)", symbol: "$" },
  { code: "EUR", label: "Euro (EUR)", symbol: "\u20AC" },
  { code: "GBP", label: "British pound (GBP)", symbol: "\u00A3" },
];

export const currencySymbol = (code: CurrencyCode): string =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? "Rs";

export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB