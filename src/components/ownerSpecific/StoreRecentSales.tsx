import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import { formatCurrency } from "@/utils/formatCurrency";
import type { PaymentMethod, RecentSale } from "@/types/owner";

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: "Cash", card: "Card", online: "Online" };

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

type Props = { sales: RecentSale[]; href: string };

export default function StoreRecentSales({ sales, href }: Props) {
  return (
    <section aria-labelledby="recent-sales-title" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 id="recent-sales-title" className="text-[15px] font-semibold text-black">
        Recent sales
      </h2>
      <p className="mt-0.5 text-[13px] text-gray-600">The latest invoices recorded at this store.</p>

      {sales.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            compact
            icon={Receipt}
            title="No sales yet"
            description="Invoices will appear here once this store records its first sale."
          />
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-gray-200">
            {sales.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black">{s.invoiceNo}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatTime(s.soldAt)} &middot; {s.itemCount} {s.itemCount === 1 ? "item" : "items"} &middot;{" "}
                    {METHOD_LABEL[s.paymentMethod]}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-black">{formatCurrency(s.total)}</p>
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-black underline-offset-4 hover:underline"
          >
            View all sales
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </>
      )}
    </section>
  );
}