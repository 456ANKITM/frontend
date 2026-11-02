import Link from "next/link";
import { CheckCircle2, PauseCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { PLAN_LABEL } from "@/config/admin";
import type { Business } from "@/types/admin";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

function Head() {
  return (
    <thead className="border-b border-gray-300 bg-gray-50">
      <tr>
        <th scope="col" className={TH}>Business</th>
        <th scope="col" className={TH}>Owner</th>
        <th scope="col" className={TH}>Plan</th>
        <th scope="col" className={TH}>Status</th>
        <th scope="col" className={TH}>Registered</th>
        <th scope="col" className={`${TH} text-right`}>Actions</th>
      </tr>
    </thead>
  );
}

type Props = {
  items: Business[];
  onToggleStatus: (business: Business) => void;
};

export default function BusinessesTable({ items, onToggleStatus }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[820px] text-sm">
        <caption className="sr-only">Registered businesses</caption>
        <Head />
        <tbody className="divide-y divide-gray-200">
          {items.map((b) => {
            const suspended = b.status === "suspended";
            return (
              <tr key={b.id} className="transition-colors hover:bg-gray-50">
                <td className={TD}>
                  <Link
                    href={`/admin/businesses/${b.id}`}
                    className="font-medium text-black underline-offset-4 hover:underline"
                  >
                    {b.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {b.storeCount} {b.storeCount === 1 ? "store" : "stores"}
                  </p>
                </td>
                <td className={TD}>
                  <p className="text-black">{b.ownerName}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{b.ownerEmail}</p>
                </td>
                <td className={`${TD} text-gray-900`}>{PLAN_LABEL[b.plan]}</td>
                <td className={TD}>
                  <StatusBadge status={b.status} />
                </td>
                <td className={`${TD} whitespace-nowrap text-gray-700`}>{formatDate(b.createdAt)}</td>
                <td className={`${TD} text-right`}>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(b)}
                    aria-label={`${suspended ? "Activate" : "Suspend"} ${b.name}`}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition ${
                      suspended
                        ? "border-black bg-black text-white hover:bg-gray-800"
                        : "border-gray-300 bg-white text-black hover:border-black"
                    }`}
                  >
                    {suspended ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <PauseCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {suspended ? "Activate" : "Suspend"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function BusinessesTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div
      className="overflow-x-auto rounded-xl border border-gray-300 bg-white"
      role="status"
      aria-label="Loading businesses"
    >
      <table className="w-full min-w-[820px] text-sm">
        <Head />
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i} className="animate-pulse">
              <td className={TD}>
                <div className="h-3.5 w-36 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-14 rounded bg-gray-100" />
              </td>
              <td className={TD}>
                <div className="h-3.5 w-28 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-40 rounded bg-gray-100" />
              </td>
              <td className={TD}>
                <div className="h-3.5 w-16 rounded bg-gray-200" />
              </td>
              <td className={TD}>
                <div className="h-6 w-20 rounded-full bg-gray-200" />
              </td>
              <td className={TD}>
                <div className="h-3.5 w-24 rounded bg-gray-200" />
              </td>
              <td className={`${TD} text-right`}>
                <div className="ml-auto h-8 w-20 rounded-lg bg-gray-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}