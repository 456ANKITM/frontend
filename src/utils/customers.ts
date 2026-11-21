import { LOYALTY_RS_PER_POINT } from "@/config/managerCustomers";
import { dayOf } from "@/utils/localDate";
import type { Customer, CustomerRow } from "@/types/managerCustomers";
import type { ManagerSale } from "@/types/managerSales";

export type CustomerValues = { name: string; phone: string; email: string; address: string };
export type CustomerErrors = Partial<Record<keyof CustomerValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS = /^[+()\d][\d\s()+-]*$/;

// Sales only store the customer's name for now, so names are matched case-insensitively.
export const customerKey = (name: string) => name.trim().toLowerCase();

// Expects values that are already trimmed.
export function validateCustomer(v: CustomerValues): CustomerErrors {
  const e: CustomerErrors = {};
  if (v.name.length < 2) e.name = "Enter the customer's name (at least 2 characters).";
  else if (v.name.length > 80) e.name = "The name can be up to 80 characters.";

  const digits = v.phone.replace(/\D/g, "").length;
  if (!v.phone) e.phone = "Enter a phone number.";
  else if (!PHONE_CHARS.test(v.phone) || digits < 7 || digits > 15) {
    e.phone = "Enter a valid phone number, for example +977 9841234567.";
  }

  if (v.email && !EMAIL.test(v.email)) e.email = "Enter a valid email address.";
  if (v.address.length > 200) e.address = "The address can be up to 200 characters.";
  return e;
}

// Groups named invoices by customer, newest first. Walk-in sales are skipped.
export function groupSalesByCustomer(sales: ManagerSale[]): Map<string, ManagerSale[]> {
  const map = new Map<string, ManagerSale[]>();
  const sorted = [...sales].sort((a, b) => b.soldAt.localeCompare(a.soldAt) || b.invoiceNo.localeCompare(a.invoiceNo));
  for (const s of sorted) {
    if (!s.customerName) continue;
    const key = customerKey(s.customerName);
    const list = map.get(key);
    if (list) list.push(s);
    else map.set(key, [s]);
  }
  return map;
}

// `sales` must be this customer's invoices, newest first.
export function toCustomerRow(c: Customer, sales: ManagerSale[]): CustomerRow {
  const valid = sales.filter((s) => !s.refund);
  const totalSpent = valid.reduce((sum, s) => sum + s.totalAmount, 0);
  return {
    ...c,
    purchaseCount: valid.length,
    totalSpent,
    amountPending: valid.filter((s) => s.paymentStatus !== "paid").reduce((sum, s) => sum + s.totalAmount, 0),
    lastPurchaseDate: valid[0] ? dayOf(valid[0].soldAt) : null,
    loyaltyPoints: Math.floor(totalSpent / LOYALTY_RS_PER_POINT),
  };
}