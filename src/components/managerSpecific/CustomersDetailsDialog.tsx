"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PaymentBadge } from "@/components/ownerSpecific/PurchasesTable";
import { DueLabel } from "@/components/ownerSpecific/SuppliersTable";
import { SaleStatusBadge } from "./ManagerSalesTable";
import { CUSTOMER_HISTORY_LIMIT } from "@/config/managerCustomers";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatNumber } from "@/utils/formatDate";
import { formatDay, formatTime } from "@/utils/localDate";
import type { CustomerRow } from "@/types/managerCustomers";
import type { ManagerSale } from "@/types/managerSales";

type Props = {
  customer: CustomerRow | null; // null = closed
  sales: ManagerSale[]; // this customer's invoices, newest first
  onClose: () => void;
};

const TH = "px-4 py-2.5 text-xs font-semibold text-gray-600";

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function CustomerDetailsDialog({ customer, sales, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (customer && !dialog.open) dialog.showModal();
    if (!customer && dialog.open) dialog.close();
  }, [customer]);

  const shown = sales.slice(0, CUSTOMER_HISTORY_LIMIT);

  return (
    <dialog
      ref={ref}
      aria-labelledby="customer-details-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {customer && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="customer-details-title" className="text-lg font-semibold text-black">
                {customer.name}
              </h2>
              <p className="mt-1 text-sm text-gray-600">Customer since {formatDay(customer.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 outline-none transition hover:bg-gray-100 hover:text-black focus-visible:ring-4 focus-visible:ring-black/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm font-medium text-black">
                <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="underline-offset-2 hover:underline">
                  {customer.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Email</dt>
              <dd className="mt-1 break-all text-sm font-medium text-black">
                {customer.email ? (
                  <a href={`mailto:${customer.email}`} className="underline-offset-2 hover:underline">
                    {customer.email}
                  </a>
                ) : (
                  <span className="font-normal text-gray-500">Not provided</span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Address</dt>
              <dd className="mt-1 text-sm font-medium text-black">
                {customer.address || <span className="font-normal text-gray-500">Not provided</span>}
              </dd>
            </div>
          </dl>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-300 p-4">
              <dt className="text-xs text-gray-500">Purchases</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-black">{customer.purchaseCount}</dd>
            </div>
            <div className="rounded-xl border border-gray-300 p-4">
              <dt className="text-xs text-gray-500">Total spent</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-black">{formatCurrency(customer.totalSpent)}</dd>
            </div>
            <div className="rounded-xl border border-gray-300 p-4">
              <dt className="text-xs text-gray-500">Payment pending</dt>
              <dd className="mt-1 text-lg tabular-nums">
                <DueLabel amount={customer.amountPending} />
              </dd>
            </div>
            <div className="rounded-xl border border-gray-300 p-4">
              <dt className="text-xs text-gray-500">Loyalty points</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-black">{formatNumber(customer.loyaltyPoints)}</dd>
            </div>
          </dl>

          <h3 className="mt-6 text-[15px] font-semibold text-black">Purchase history</h3>
          <p className="mt-1 text-[13px] text-gray-600">Refunded sales are listed but not counted in the figures above.</p>

          {sales.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-600">
              {customer.name} hasn&apos;t bought anything yet.
            </p>
          ) : (
            <>
              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-300">
                <table className="w-full min-w-[680px] text-sm">
                  <caption className="sr-only">Purchases by {customer.name}</caption>
                  <thead className="border-b border-gray-300 bg-gray-50">
                    <tr>
                      <th scope="col" className={`${TH} text-left`}>Invoice</th>
                      <th scope="col" className={`${TH} text-left`}>Items</th>
                      <th scope="col" className={`${TH} text-right`}>Total</th>
                      <th scope="col" className={`${TH} text-left`}>Payment</th>
                      <th scope="col" className={`${TH} text-left`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shown.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-black">{s.invoiceNo}</p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatDay(s.soldAt.slice(0, 10))} &middot; {formatTime(s.soldAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <p>
                            {s.items.length} {s.items.length === 1 ? "item" : "items"}
                          </p>
                          <p className="mt-0.5 max-w-[16rem] truncate text-xs text-gray-500">
                            {s.items.map((it) => it.productName).join(", ")}
                          </p>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium tabular-nums ${
                            s.refund ? "text-gray-500 line-through" : "text-black"
                          }`}
                        >
                          {formatCurrency(s.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <PaymentBadge status={s.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <SaleStatusBadge refunded={!!s.refund} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sales.length > shown.length && (
                <p className="mt-2 text-[13px] text-gray-600">
                  Showing the latest {shown.length} of {sales.length} purchases. Open Sales to see them all.
                </p>
              )}
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}