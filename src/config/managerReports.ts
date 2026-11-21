import { REPORT_TYPES } from "@/config/reports";
import type { ReportType } from "@/types/reports";

// Your docs give Store Managers the sales summary, inventory valuation and top products reports.
// Profit and loss, store comparison and staff performance are Owner only.
export const MANAGER_REPORT_TYPES: ReportType[] = ["sales_summary", "inventory_valuation", "top_products"];

export const MANAGER_REPORT_OPTIONS = REPORT_TYPES.filter((t) => MANAGER_REPORT_TYPES.includes(t.value));