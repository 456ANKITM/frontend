import type { ManagerStoreInfo } from "@/types/manager";
import type { PurchasesListData } from "@/types/owner";

export interface ManagerPurchasesData extends PurchasesListData {
  store: ManagerStoreInfo | null; // null = the manager is not assigned to a store yet
}