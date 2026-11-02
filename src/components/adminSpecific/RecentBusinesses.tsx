import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { formatDate } from "@/utils/formatDate";
import type { RecentBusiness } from "@/types/admin";

export default function RecentBusinesses({ businesses }: { businesses: RecentBusiness[] }) {
  return (
    <section aria-labelledby="recent-title" className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
        <div>
          <h2 id="recent-title" className="text-[15px] font-semibold text-black">
            Recent businesses
          </h2>
          <p className="mt-0.5 text-[13px] text-gray-600">Newly registered tenants.</p>
        </div>
        <Link
          href="/admin/businesses"
          className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
        >
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <EmptyState
            icon={Building2}
            title="No businesses yet"
            description="Registered businesses will appear here once tenants join the platform."
            compact
          />
        </div>
      ) : (
        <>
          {/* md+: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Recently registered businesses</caption>
              <thead>
                <tr className="border-y border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                  <th scope="col" className="px-6 py-3">Business</th>
                  <th scope="col" className="px-4 py-3">Owner</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Created</th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {businesses.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-gray-50">
                    <th scope="row" className="px-6 py-3.5 font-medium text-black">
                      {b.name}
                    </th>
                    <td className="px-4 py-3.5 text-gray-600">{b.ownerName}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{formatDate(b.createdAt)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        href={`/admin/businesses/${b.id}`}
                        aria-label={`View ${b.name}`}
                        className="rounded text-sm font-semibold text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* mobile: cards */}
          <ul className="divide-y divide-gray-100 border-t border-gray-200 md:hidden">
            {businesses.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/businesses/${b.id}`}
                  className="block px-5 py-4 outline-none transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-black">{b.name}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-[13px] text-gray-600">
                    {b.ownerName} &middot; {formatDate(b.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}