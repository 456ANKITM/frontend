import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDay } from "@/utils/localDate";
import type { PaymentStatus, Purchase } from "@/types/owner";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  paid: "Paid",
  partial: "Partially paid",
  due: "Payment due",
};

// Text + icon, never color alone.
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const cfg = {
    paid: { icon: CheckCircle2, cls: "border-gray-300 bg-white text-gray-900" },
    partial: { icon: Clock, cls: "border-black bg-white text-black" },
    due: { icon: AlertCircle, cls: "border-black bg-black text-white" },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {PAYMENT_LABEL[status]}
    </span>
  );
}

type Props = { purchases: Purchase[]; onView: (p: Purchase) => void };

export default function PurchasesTable({ purchases, onView }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[980px] text-sm">
        <caption className="sr-only">Purchase records across your stores</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Purchase</th>
            <th scope="col" className={TH}>Supplier</th>
            <th scope="col" className={TH}>Store</th>
            <th scope="col" className={TH}>Items</th>
            <th scope="col" className={`${TH} text-right`}>Total</th>
            <th scope="col" className={TH}>Payment</th>
            <th scope="col" className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {purchases.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-gray-50">
              <td className={TD}>
                <p className="font-medium text-black">{p.referenceNo}</p>
                <p className="mt-0.5 text-xs text-gray-500">{formatDay(p.purchaseDate)}</p>
              </td>
              <td className={`${TD} text-gray-900`}>{p.supplierName}</td>
              <td className={`${TD} text-gray-900`}>{p.storeName}</td>
              <td className={`${TD} text-gray-700`}>
                {p.items.length} {p.items.length === 1 ? "item" : "items"}
              </td>
              <td className={`${TD} text-right font-medium tabular-nums text-black`}>{formatCurrency(p.totalAmount)}</td>
              <td className={TD}>
                <PaymentBadge status={p.paymentStatus} />
              </td>
              <td className={`${TD} text-right`}>
                <button
                  type="button"
                  onClick={() => onView(p)}
                  aria-label={`View purchase ${p.referenceNo}`}
                  className="inline-flex h-8 items-center rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PurchasesTableSkeleton({ rows = 8 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white" role="status" aria-label="Loading purchases">
      <table className="w-full min-w-[980px] text-sm" aria-hidden="true">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {["Purchase", "Supplier", "Store", "Items", "Total", "Payment", "Actions"].map((h) => (
              <th key={h} className={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={TD}>
                <div className={`h-3.5 w-20 ${bar}`} />
                <div className={`mt-2 h-3 w-24 ${bar}`} />
              </td>
              <td className={TD}><div className={`h-3.5 w-40 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-32 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-14 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-20 ${bar}`} /></td>
              <td className={TD}><div className={`h-6 w-24 rounded-full ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-8 w-14 rounded-lg ${bar}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}