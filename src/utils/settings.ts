import type { BusinessSettings } from "@/types/settings";

export type ProfileDraft = Pick<BusinessSettings, "name" | "contactEmail" | "contactPhone" | "address">;
export type ProfileErrors = Partial<Record<keyof ProfileDraft | "logoUrl", string>>;
export type RegionalErrors = Partial<Record<"currency" | "taxRate", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS = /^[+()\d][\d\s()+-]*$/;

// Expects values that are already trimmed.
export function validateProfile(d: ProfileDraft): ProfileErrors {
  const errors: ProfileErrors = {};

  if (d.name.length < 2) errors.name = "Enter your business name.";
  else if (d.name.length > 80) errors.name = "The name can be up to 80 characters.";

  if (!d.contactEmail) errors.contactEmail = "Enter a contact email.";
  else if (!EMAIL.test(d.contactEmail)) errors.contactEmail = "Enter a valid email address.";

  if (d.contactPhone) {
    const digits = d.contactPhone.replace(/\D/g, "").length;
    if (!PHONE_CHARS.test(d.contactPhone) || digits < 7 || digits > 15) {
      errors.contactPhone = "Enter a valid phone number, for example +977 1 4221000.";
    }
  }

  if (d.address.length > 200) errors.address = "The address can be up to 200 characters.";

  return errors;
}

export function parseTaxRate(raw: string): { value: number | null; error?: string } {
  const t = raw.trim();
  if (!t) return { value: null, error: "Enter a tax rate. Use 0 if you don't charge tax." };
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(t)) {
    return { value: null, error: "Enter a number such as 13 or 13.5 (up to 2 decimal places)." };
  }
  const value = Number(t);
  if (value > 100) return { value: null, error: "The tax rate can't be more than 100%." };
  return { value };
}

// Plan prices are billed by the platform, so they don't follow the business's display currency.
export const formatPlanAmount = (amount: number, currency: string) =>
  `${currency} ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount)}`;