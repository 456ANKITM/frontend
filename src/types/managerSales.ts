import type { ManagerStoreInfo } from "@/types/manager";
import type { Sale } from "@/types/owner";

export type RefundReason = "returned" | "damaged" | "wrong_item" | "price_error" | "other";
export type SaleStatusFilter = "all" | "completed" | "refunded";

export interface Refund {
  reason: RefundReason;
  note: string;
  refundedBy: string;
  refundedAt: string; // local date-time "YYYY-MM-DDTHH:mm"
  amount: number;
}

// A sale plus its refund, if it has one.
export interface ManagerSale extends Sale {
  refund: Refund | null;
}

export interface RefundSalePayload {
  saleId: string;
  reason: RefundReason;
  note: string; // required when reason is "other"
}

export interface ManagerSalesData {
  store: ManagerStoreInfo | null; // null = the manager is not assigned to a store yet
  sales: ManagerSale[];
}