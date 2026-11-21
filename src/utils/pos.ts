import type { DiscountType } from "@/types/pos";

// Empty or invalid text counts as 0.
export function toNumber(v: string): number {
  if (v.trim() === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function discountError(subtotal: number, type: DiscountType, value: number): string | null {
  if (value < 0) return "The discount can't be negative.";
  if (type === "percent" && value > 100) return "A percentage discount can't be more than 100.";
  if (type === "amount" && value > subtotal) return "The discount can't be more than the subtotal.";
  return null;
}

// Same rounding as the Sales dummy data: discount is taken off first, tax is charged on the rest.
// The backend must repeat this calculation and never trust totals sent by the browser.
export function calculateTotals(subtotal: number, type: DiscountType, discountValue: number, taxRate: number) {
  const raw = type === "percent" ? (subtotal * discountValue) / 100 : discountValue;
  const discount = Math.round(Math.min(Math.max(raw, 0), subtotal));
  const tax = Math.round(((subtotal - discount) * Math.max(taxRate, 0)) / 100);
  return { discount, tax, total: subtotal - discount + tax };
}