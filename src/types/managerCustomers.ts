import type { ManagerStoreInfo } from "@/types/manager";
import type { ManagerSale } from "@/types/managerSales";

export type CustomerBalanceFilter = "all" | "pending" | "clear";

// Maps to the `customers` collection in the docs (without loyaltyPoints, which is worked out for now).
export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  email: string; // "" = not set
  address: string; // "" = not set
  createdAt: string; // ISO date (YYYY-MM-DD)
}

export interface NewCustomerPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
}

// A customer plus figures worked out from their sales. Refunded sales are left out.
export interface CustomerRow extends Customer {
  purchaseCount: number;
  totalSpent: number;
  amountPending: number; // total of sales that are partially paid or still due
  lastPurchaseDate: string | null; // ISO date, null = never bought anything
  loyaltyPoints: number;
}

export interface ManagerCustomersData {
  store: ManagerStoreInfo | null; // null = the manager is not assigned to a store yet
  customers: Customer[];
  sales: ManagerSale[]; // every invoice of the store, used for the purchase history
}