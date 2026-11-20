import { AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDay } from "@/utils/localDate";
import type { SupplierRow } from "@/types/owner";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

// Icon + text, never color alone.
export function DueLabel({ amount }: { amount: number }) {
  if (amount <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-gray-600">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        None
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-black">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      {formatCurrency(amount)}
    </span>
  );
}

type Props = { suppliers: SupplierRow[]; onView: (s: SupplierRow) => void };

export default function SuppliersTable({ suppliers, onView }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[1080px] text-sm">
        <caption className="sr-only">Supplier directory</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Supplier</th>
            <th scope="col" className={TH}>Contact</th>
            <th scope="col" className={`${TH} text-right`}>Purchases</th>
            <th scope="col" className={`${TH} text-right`}>Total purchased</th>
            <th scope="col" className={`${TH} text-right`}>Payment due</th>
            <th scope="col" className={TH}>Last purchase</th>
            <th scope="col" className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.map((s) => (
            <tr key={s.id} className="transition-colors hover:bg-gray-50">
              <td className={TD}>
                <p className="font-medium text-black">{s.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">{s.address}</p>
              </td>
              <td className={TD}>
                <p className="text-gray-900">{s.contactPerson}</p>
                <p className="mt-0.5 text-xs text-gray-500">{s.phone}</p>
              </td>
              <td className={`${TD} text-right tabular-nums text-gray-900`}>{s.purchaseCount}</td>
              <td className={`${TD} text-right font-medium tabular-nums text-black`}>
                {formatCurrency(s.totalPurchased)}
              </td>
              <td className={`${TD} text-right tabular-nums`}>
                <DueLabel amount={s.amountDue} />
              </td>
              <td className={`${TD} text-gray-700`}>
                {s.lastPurchaseDate ? formatDay(s.lastPurchaseDate) : "No purchases"}
              </td>
              <td className={`${TD} text-right`}>
                <button
                  type="button"
                  onClick={() => onView(s)}
                  aria-label={`View supplier ${s.name}`}
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

export function SuppliersTableSkeleton({ rows = 8 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white" role="status" aria-label="Loading suppliers">
      <table className="w-full min-w-[1080px] text-sm" aria-hidden="true">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {["Supplier", "Contact", "Purchases", "Total purchased", "Payment due", "Last purchase", "Actions"].map((h) => (
              <th key={h} className={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={TD}>
                <div className={`h-3.5 w-40 ${bar}`} />
                <div className={`mt-2 h-3 w-48 ${bar}`} />
              </td>
              <td className={TD}>
                <div className={`h-3.5 w-28 ${bar}`} />
                <div className={`mt-2 h-3 w-24 ${bar}`} />
              </td>
              <td className={TD}><div className={`ml-auto h-3.5 w-8 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-24 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-20 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-24 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-8 w-14 rounded-lg ${bar}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}