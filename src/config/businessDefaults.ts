export const BUSINESS_DEFAULTS = {
  country: "Nepal",
  currency: "NPR",
  timezone: "Asia/Kathmandu",
  fiscalYearStart: "07-16",
} as const;

// Options shown in the selects. Extend once the backend supports more.
export const COUNTRY_OPTIONS = ["Nepal"];
export const CURRENCY_OPTIONS = ["NPR"];
export const TIMEZONE_OPTIONS = ["Asia/Kathmandu"];

// Placeholder until the backend password policy is final.
export const PASSWORD_MIN_LENGTH = 8;