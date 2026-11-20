import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { PaymentBadge } from "./PurchasesTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDay, formatTime } from "@/utils/localDate";
import type { PaymentMethod, Sale } from "@/types/owner";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  online: "Online",
};

const METHOD_ICON = { cash: Banknote, card: CreditCard, online: Smartphone } as const;

// Icon + text, never icon alone.
export function MethodLabel({ method }: { method: PaymentMethod }) {
  const Icon = METHOD_ICON[method];
  return (
    <span className="inline-flex items-center gap-2 text-gray-900">
      <Icon className="h-4 w-4 text-gray-600" aria-hidden="true" />
      {METHOD_LABEL[method]}
    </span>
  );
}

type Props = { sales: Sale[]; onView: (s: Sale) => void };

export default function SalesTable({ sales, onView }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[1080px] text-sm">
        <caption className="sr-only">Sales invoices across your stores</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Invoice</th>
            <th scope="col" className={TH}>Customer</th>
            <th scope="col" className={TH}>Store</th>
            <th scope="col" className={TH}>Items</th>
            <th scope="col" className={TH}>Method</th>
            <th scope="col" className={`${TH} text-right`}>Total</th>
            <th scope="col" className={TH}>Payment</th>
            <th scope="col" className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((s) => (
            <tr key={s.id} className="transition-colors hover:bg-gray-50">
              <td className={TD}>
                <p className="font-medium text-black">{s.invoiceNo}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {formatDay(s.soldAt.slice(0, 10))} &middot; {formatTime(s.soldAt)}
                </p>
              </td>
              <td className={`${TD} ${s.customerName ? "text-gray-900" : "text-gray-600"}`}>
                {s.customerName ?? "Walk-in customer"}
              </td>
              <td className={`${TD} text-gray-900`}>{s.storeName}</td>
              <td className={`${TD} text-gray-700`}>
                {s.items.length} {s.items.length === 1 ? "item" : "items"}
              </td>
              <td className={TD}>
                <MethodLabel method={s.paymentMethod} />
              </td>
              <td className={`${TD} text-right font-medium tabular-nums text-black`}>{formatCurrency(s.totalAmount)}</td>
              <td className={TD}>
                <PaymentBadge status={s.paymentStatus} />
              </td>
              <td className={`${TD} text-right`}>
                <button
                  type="button"
                  onClick={() => onView(s)}
                  aria-label={`View sale ${s.invoiceNo}`}
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

export function SalesTableSkeleton({ rows = 8 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white" role="status" aria-label="Loading sales">
      <table className="w-full min-w-[1080px] text-sm" aria-hidden="true">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {["Invoice", "Customer", "Store", "Items", "Method", "Total", "Payment", "Actions"].map((h) => (
              <th key={h} className={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={TD}>
                <div className={`h-3.5 w-20 ${bar}`} />
                <div className={`mt-2 h-3 w-28 ${bar}`} />
              </td>
              <td className={TD}><div className={`h-3.5 w-32 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-32 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-14 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-16 ${bar}`} /></td>
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