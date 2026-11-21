import { PaymentBadge } from "@/components/ownerSpecific/PurchasesTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDay } from "@/utils/localDate";
import type { Purchase } from "@/types/owner";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

type Props = { purchases: Purchase[]; onView: (p: Purchase) => void };

// Same as the Owner's table, without the Store column (a manager only has one store).
export default function ManagerPurchasesTable({ purchases, onView }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[840px] text-sm">
        <caption className="sr-only">Purchases recorded at your store</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Purchase</th>
            <th scope="col" className={TH}>Supplier</th>
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

export function ManagerPurchasesTableSkeleton({ rows = 8 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white" role="status" aria-label="Loading purchases">
      <table className="w-full min-w-[840px] text-sm" aria-hidden="true">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {["Purchase", "Supplier", "Items", "Total", "Payment", "Actions"].map((h) => (
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