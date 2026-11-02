import Link from "next/link";
import { Building2, PauseCircle } from "lucide-react";

export default function QuickActions() {
  return (
    <section aria-labelledby="actions-title" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 id="actions-title" className="text-[15px] font-semibold text-black">
        Quick actions
      </h2>

      <div className="mt-4 space-y-2.5">
        <Link
          href="/admin/businesses"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          View all businesses
        </Link>
        <Link
          href="/admin/businesses?status=suspended"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-black outline-none transition-colors hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-black/20"
        >
          <PauseCircle className="h-4 w-4" aria-hidden="true" />
          View suspended businesses
        </Link>
      </div>
    </section>
  );
}