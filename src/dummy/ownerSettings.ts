import { AdminApiError } from "@/dummy/adminDashboard";
import { listProducts } from "@/dummy/ownerInventory";
import { getStoreOptions } from "@/dummy/ownerStores";
import { CURRENCIES, currencySymbol } from "@/config/settings";
import { daysAgoLocal } from "@/utils/localDate";
import { setCurrencySymbol } from "@/utils/formatCurrency";
import type {
  BusinessSettings,
  BusinessSettingsPayload,
  Invoice,
  SettingsData,
  SubscriptionInfo,
  SubscriptionStatus,
} from "@/types/settings";

type Scenario = "ok" | "forbidden" | "session" | "network";
// Change this to preview each page state: "ok" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Change this to preview the subscription card: "active" | "trial" | "suspended"
const PLAN_STATUS = "active" as SubscriptionStatus;
// Set to true to preview a failed save.
const FAIL_SAVE = false;

export type SettingsFieldErrors = Partial<Record<keyof BusinessSettings, string>>;

export class SettingsApiError extends Error {
  fieldErrors?: SettingsFieldErrors;
  constructor(message: string, fieldErrors?: SettingsFieldErrors) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

// In-memory copy so saving visibly works while we are UI-only.
let SETTINGS: BusinessSettings = {
  name: "Himal Retail Pvt. Ltd.",
  contactEmail: "owner@himalretail.com.np",
  contactPhone: "+977 1 4221000",
  address: "New Road, Kathmandu, Nepal",
  logoUrl: null,
  currency: "NPR",
  taxRate: 13,
};

const inDays = (n: number) => daysAgoLocal(-n); // a date n days from today

// TODO(integration): the subscription comes from the business document (subscriptionPlan, status)
// plus the billing provider. The docs have no billing endpoints yet, so the plan, its limits, usage
// and invoices are placeholders. Usage should be counted by the backend, scoped by businessId.
function buildSubscription(): SubscriptionInfo {
  const invoices: Invoice[] =
    PLAN_STATUS === "trial"
      ? []
      : Array.from({ length: 5 }, (_, i) => ({
          id: `inv_${i}`,
          number: `SUB-${1005 - i}`,
          date: daysAgoLocal(18 + i * 30),
          description: "Growth plan, monthly",
          amount: 4999,
          status: "paid" as const,
        }));

  return {
    planName: "Growth",
    status: PLAN_STATUS,
    price: 4999,
    billingCurrency: "Rs",
    interval: "month",
    nextBillingDate: PLAN_STATUS === "suspended" ? null : inDays(PLAN_STATUS === "trial" ? 9 : 12),
    memberSince: "2025-11-12",
    features: [
      "Up to 5 stores",
      "Unlimited Store Managers",
      "Up to 5,000 products",
      "Reports with CSV export",
      "Email support",
    ],
    usage: [
      { label: "Stores", used: getStoreOptions().length, limit: 5 },
      { label: "Products", used: listProducts().length, limit: 5000 },
    ],
    invoices,
  };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/settings/business (Owner only). The business profile
// comes from the `businesses` document; scope by the businessId from the token.
export async function fetchSettings(): Promise<SettingsData> {
  await wait(700);
  if (SCENARIO !== "ok") throw new AdminApiError(SCENARIO);
  return { business: { ...SETTINGS }, subscription: buildSubscription() };
}

// TODO(integration): replace with PATCH /api/v1/settings/business { name, logo, currency, taxRate, ... }.
// The backend must validate every field, scope by the Owner's businessId, and upload the logo to
// Cloudinary/S3 (send it as multipart/form-data and store the returned URL, not the file itself).
// The docs list name, logo, currency and tax rate for this endpoint; the contact fields are on the
// same business document, so allow them here too or add a separate endpoint.
export async function updateBusinessSettings(input: BusinessSettingsPayload): Promise<BusinessSettings> {
  await wait(700);
  if (FAIL_SAVE) throw new SettingsApiError("Save failed");

  const errors: SettingsFieldErrors = {};
  if (input.name !== undefined && input.name.trim().length < 2) errors.name = "Enter your business name.";
  if (input.currency !== undefined && !CURRENCIES.some((c) => c.code === input.currency)) {
    errors.currency = "Choose a currency from the list.";
  }
  if (input.taxRate !== undefined && (!Number.isFinite(input.taxRate) || input.taxRate < 0 || input.taxRate > 100)) {
    errors.taxRate = "Enter a rate between 0 and 100.";
  }
  if (Object.keys(errors).length > 0) throw new SettingsApiError("Validation failed", errors);

  const next: BusinessSettings = { ...SETTINGS, ...input };
  next.name = next.name.trim();
  next.contactEmail = next.contactEmail.trim();
  next.contactPhone = next.contactPhone.trim();
  next.address = next.address.trim();
  SETTINGS = next;

  // The rest of the app formats money with this symbol until the page is reloaded.
  setCurrencySymbol(currencySymbol(next.currency));
  return { ...SETTINGS };
}