import { INVOICE_PREFIX_MAX, INVOICE_PREFIX_MIN, PASSWORD_MIN, RECEIPT_FOOTER_MAX } from "@/config/managerSettings";

const PHONE_CHARS = /^[+()\d][\d\s()+-]*$/;

export type ProfileValues = { name: string; phone: string };
export type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

// Expects values that are already trimmed.
export function validateProfile(v: ProfileValues): ProfileErrors {
  const e: ProfileErrors = {};
  if (v.name.length < 2) e.name = "Enter your name (at least 2 characters).";
  else if (v.name.length > 80) e.name = "Your name can be up to 80 characters.";

  if (v.phone) {
    const digits = v.phone.replace(/\D/g, "").length;
    if (!PHONE_CHARS.test(v.phone) || digits < 7 || digits > 15) {
      e.phone = "Enter a valid phone number, for example +977 9841234567.";
    }
  }
  return e;
}

// TODO(integration): keep these rules in sync with the registration password rules and enforce them on the backend.
export const PASSWORD_RULES: { id: string; label: string; test: (p: string) => boolean }[] = [
  { id: "length", label: `At least ${PASSWORD_MIN} characters`, test: (p) => p.length >= PASSWORD_MIN },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /\d/.test(p) },
];

export type PasswordErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;

export function validatePasswordChange(current: string, next: string, confirm: string): PasswordErrors {
  const e: PasswordErrors = {};
  if (!current) e.currentPassword = "Enter your current password.";
  if (!next) e.newPassword = "Enter a new password.";
  else if (!PASSWORD_RULES.every((r) => r.test(next))) e.newPassword = "Your new password doesn't meet every requirement below.";
  else if (next === current) e.newPassword = "Choose a password different from your current one.";
  if (!confirm) e.confirmPassword = "Re-enter your new password.";
  else if (next && confirm !== next) e.confirmPassword = "The passwords don't match.";
  return e;
}

export type ReceiptValues = { invoicePrefix: string; receiptFooter: string };
export type ReceiptErrors = Partial<Record<keyof ReceiptValues, string>>;

// Expects values that are already trimmed (the prefix also upper-cased).
export function validateReceipt(v: ReceiptValues): ReceiptErrors {
  const e: ReceiptErrors = {};
  if (!new RegExp(`^[A-Z0-9]{${INVOICE_PREFIX_MIN},${INVOICE_PREFIX_MAX}}$`).test(v.invoicePrefix)) {
    e.invoicePrefix = `Use ${INVOICE_PREFIX_MIN} to ${INVOICE_PREFIX_MAX} letters or numbers, for example INV.`;
  }
  if (v.receiptFooter.length > RECEIPT_FOOTER_MAX) {
    e.receiptFooter = `The footer can be up to ${RECEIPT_FOOTER_MAX} characters.`;
  }
  return e;
}