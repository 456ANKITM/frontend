import type { ManagerStoreInfo } from "@/types/manager";
import type { ReportSource } from "@/types/reports";

export interface ManagerReportsData {
  store: ManagerStoreInfo | null; // null = the manager is not assigned to a store yet
  source: ReportSource; // this store's sales, purchases and products only
}