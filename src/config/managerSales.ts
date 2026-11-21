import type { RefundReason } from "@/types/managerSales";

export const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: "returned", label: "Customer returned the goods" },
  { value: "damaged", label: "Goods were damaged or faulty" },
  { value: "wrong_item", label: "Wrong item sold" },
  { value: "price_error", label: "Price or billing mistake" },
  { value: "other", label: "Other (add a note)" },
];

export const REFUND_REASON_LABEL = Object.fromEntries(REFUND_REASONS.map((r) => [r.value, r.label])) as Record<
  RefundReason,
  string
>;

export const REFUND_NOTE_MAX = 200;