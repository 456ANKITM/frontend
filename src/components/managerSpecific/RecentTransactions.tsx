import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import { PaymentBadge } from "@/components/ownerSpecific/PurchasesTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { daysAgoLocal, formatDay, todayLocal } from "@/utils/localDate";
import type { ManagerTransaction } from "@/types/manager";
import type { PaymentMethod } from "@/types/owner";

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: "Cash", card: "Card", online: "Online" };

// soldAt is a local date-time without a timezone, e.g. "2026-11-21T14:05"
function when(soldAt: string) {
  const [day, time] = soldAt.split("T");
  const label = day === todayLocal() ? "Today" : day === daysAgoLocal(1) ? "Yesterday" : formatDay(day);
  const clock = new Date(soldAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${label}, ${time ? clock : ""}`.trim();
}

export default function RecentTransactions({ items }: { items: ManagerTransaction[] }) {
  return (
    <section aria-labelledby="recent-tx-title" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 id="recent-tx-title" className="text-[15px] font-semibold text-black">
        Recent transactions
      </h2>
      <p className="mt-0.5 text-[13px] text-gray-600">The latest invoices recorded at your store.</p>

      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            compact
            icon={Receipt}
            title="No sales yet"
            description="Invoices will appear here as soon as you record your first sale."
          />
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-gray-200">
            {items.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-black">
                    {t.invoiceNo}
                    {t.paymentStatus !== "paid" && <PaymentBadge status={t.paymentStatus} />}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {when(t.soldAt)} &middot; {t.itemCount} {t.itemCount === 1 ? "item" : "items"} &middot;{" "}
                    {t.customerName ?? "Walk-in customer"} &middot; {METHOD_LABEL[t.paymentMethod]}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-black">{formatCurrency(t.totalAmount)}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/sales"
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