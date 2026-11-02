import { CheckCircle2, PauseCircle, Store } from "lucide-react";
import EmptyState from "./EmptyState";
import type { StoreStatus, StoreSummary } from "@/types/admin";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// Same visual language as StatusBadge: text + icon, never color alone.
function StoreStatusPill({ status }: { status: StoreStatus }) {
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

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

export default function BusinessStoresCard({ stores }: { stores: StoreSummary[] }) {
  return (
    <section aria-labelledby="stores-title" className="rounded-xl border border-gray-300 bg-white">
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 id="stores-title" className="text-[15px] font-semibold text-black">
          Stores
        </h2>
        <span className="text-sm text-gray-600">{stores.length} total</span>
      </div>

      {stores.length === 0 ? (
        <div className="p-5">
          <EmptyState
            compact
            icon={Store}
            title="No stores yet"
            description="This business hasn't created a store. Stores appear here once the owner adds one."
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto border-t border-gray-200">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Stores of this business</caption>
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className={TH}>Store</th>
                <th scope="col" className={TH}>Manager</th>
                <th scope="col" className={TH}>Status</th>
                <th scope="col" className={TH}>Opened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stores.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-gray-50">
                  <td className={TD}>
                    <p className="font-medium text-black">{s.name}</p>
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
                  <td className={`${TD} whitespace-nowrap text-gray-700`}>{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}