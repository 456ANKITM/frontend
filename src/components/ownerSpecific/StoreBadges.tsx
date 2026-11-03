import { CheckCircle2, PauseCircle, TriangleAlert } from "lucide-react";
import type { StoreStatus } from "@/types/admin";

// Text + icon, never color alone (same language as StatusBadge).
export function StoreStatusPill({ status }: { status: StoreStatus }) {
  const active = status === "active";
  const Icon = active ? CheckCircle2 : PauseCircle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        active ? "border-black bg-black text-white" : "border-dashed border-gray-400 bg-white text-gray-700"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function StockAlertBadge({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        None
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black px-2.5 py-1 text-xs font-medium text-black">
      <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
      {count} {count === 1 ? "alert" : "alerts"}
    </span>
  );
}