import type { PaymentStatus } from "@/types/owner";

export type CurrencyCode = "NPR" | "INR" | "USD" | "EUR" | "GBP";

// Maps to GET/PATCH /api/v1/settings/business
export interface BusinessSettings {
  name: string;
  contactEmail: string;
  contactPhone: string; // "" = not set
  address: string; // "" = not set
  logoUrl: string | null;
  currency: CurrencyCode;
  taxRate: number; // percent, 0 to 100
}

export type BusinessSettingsPayload = Partial<BusinessSettings>;

export type SubscriptionStatus = "active" | "trial" | "suspended";

export interface UsageItem {
  label: string;
  used: number;
  limit: number | null; // null = unlimited
}

export interface Invoice {
  id: string;
  number: string;
  date: string; // ISO date (YYYY-MM-DD)
  description: string;
  amount: number;
  status: Extract<PaymentStatus, "paid" | "due">;
}

export interface SubscriptionInfo {
  planName: string;
  status: SubscriptionStatus;
  price: number;
  billingCurrency: string; // what the platform bills in, e.g. "Rs"
  interval: "month" | "year";
  nextBillingDate: string | null; // renewal date, or trial end date
  memberSince: string; // ISO date
  features: string[];
  usage: UsageItem[];
  invoices: Invoice[];
}

export interface SettingsData {
  business: BusinessSettings;
  subscription: SubscriptionInfo;
}