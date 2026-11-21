import { DueLabel } from "@/components/ownerSpecific/SuppliersTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatNumber } from "@/utils/formatDate";
import { formatDay } from "@/utils/localDate";
import type { CustomerRow } from "@/types/managerCustomers";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

type Props = { customers: CustomerRow[]; onView: (c: CustomerRow) => void };

export default function ManagerCustomersTable({ customers, onView }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[1080px] text-sm">
        <caption className="sr-only">Customers of your store</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Customer</th>
            <th scope="col" className={TH}>Contact</th>
            <th scope="col" className={`${TH} text-right`}>Purchases</th>
            <th scope="col" className={`${TH} text-right`}>Total spent</th>
            <th scope="col" className={`${TH} text-right`}>Payment pending</th>
            <th scope="col" className={TH}>Last purchase</th>
            <th scope="col" className={`${TH} text-right`}>Loyalty points</th>
            <th scope="col" className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-gray-50">
              <td className={TD}>
                <p className="font-medium text-black">{c.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">Customer since {formatDay(c.createdAt)}</p>
              </td>
              <td className={TD}>
                <p className="text-gray-900">{c.phone}</p>
                <p className="mt-0.5 text-xs text-gray-500">{c.email || "No email"}</p>
              </td>
              <td className={`${TD} text-right tabular-nums text-gray-900`}>{c.purchaseCount}</td>
              <td className={`${TD} text-right font-medium tabular-nums text-black`}>{formatCurrency(c.totalSpent)}</td>
              <td className={`${TD} text-right tabular-nums`}>
                <DueLabel amount={c.amountPending} />
              </td>
              <td className={`${TD} text-gray-700`}>{c.lastPurchaseDate ? formatDay(c.lastPurchaseDate) : "No purchases"}</td>
              <td className={`${TD} text-right tabular-nums text-gray-900`}>{formatNumber(c.loyaltyPoints)}</td>
              <td className={`${TD} text-right`}>
                <button
                  type="button"
                  onClick={() => onView(c)}
                  aria-label={`View customer ${c.name}`}
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

export function ManagerCustomersTableSkeleton({ rows = 8 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white" role="status" aria-label="Loading customers">
      <table className="w-full min-w-[1080px] text-sm" aria-hidden="true">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {["Customer", "Contact", "Purchases", "Total spent", "Payment pending", "Last purchase", "Loyalty points", "Actions"].map((h) => (
              <th key={h} className={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={TD}>
                <div className={`h-3.5 w-36 ${bar}`} />
                <div className={`mt-2 h-3 w-32 ${bar}`} />
              </td>
              <td className={TD}>
                <div className={`h-3.5 w-28 ${bar}`} />
                <div className={`mt-2 h-3 w-36 ${bar}`} />
              </td>
              <td className={TD}><div className={`ml-auto h-3.5 w-8 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-24 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-20 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-24 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-10 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-8 w-14 rounded-lg ${bar}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}