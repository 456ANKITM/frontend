import Link from "next/link";
import { StockAlertBadge, StoreStatusPill } from "./StoreBadges";
import { SalesChange } from "./StoresCard";
import { formatCurrency } from "@/utils/formatCurrency";
import type { OwnerStore } from "@/types/owner";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

export default function StoresTable({ stores }: { stores: OwnerStore[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[820px] text-sm">
        <caption className="sr-only">Your stores</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Store</th>
            <th scope="col" className={TH}>Manager</th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={`${TH} text-right`}>Today&apos;s sales</th>
            <th scope="col" className={TH}>Stock alerts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stores.map((s) => (
            <tr key={s.id} className="transition-colors hover:bg-gray-50">
              <td className={TD}>
                <Link
                  href={`/stores/${s.id}`}
                  className="font-medium text-black underline-offset-4 hover:underline"
                >
                  {s.name}
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">{s.location}</p>
              </td>
              <td className={TD}>
                {s.managerName ? (
                  <span className="text-black">{s.managerName}</span>
                ) : (
                  <span className="text-gray-500">Not assigned</span>
                )}
              </td>
              <td className={TD}>
                <StoreStatusPill status={s.status} />
              </td>
              <td className={`${TD} text-right`}>
                <p className="font-medium tabular-nums text-black">{formatCurrency(s.salesToday)}</p>
                <p className="mt-0.5">
                  <SalesChange today={s.salesToday} yesterday={s.salesYesterday} />
                </p>
              </td>
              <td className={TD}>
                <StockAlertBadge count={s.lowStockCount} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}