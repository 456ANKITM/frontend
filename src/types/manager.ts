import type { LowStockItem, PaymentMethod, PaymentStatus } from "@/types/owner";

export interface ManagerStoreInfo {
  id: string;
  name: string;
  location: string;
}

export interface ManagerSummary {
  salesToday: number;
  salesYesterday: number;
  transactionsToday: number;
  lowStockCount: number;
  outOfStockCount: number;
  unpaidCount: number; // recent sales that are partially paid or still due
  unpaidAmount: number;
}

export interface ManagerTransaction {
  id: string;
  invoiceNo: string;
  soldAt: string; // local date-time, "YYYY-MM-DDTHH:mm"
  customerName: string | null; // null = walk-in customer
  itemCount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export interface ManagerDashboardData {
  store: ManagerStoreInfo | null; // null = the manager is not assigned to a store yet
  summary: ManagerSummary;
  lowStock: LowStockItem[]; // most urgent first (out of stock, then lowest vs reorder level)
  recent: ManagerTransaction[]; // newest first
  updatedAt: string; // ISO date-time
}