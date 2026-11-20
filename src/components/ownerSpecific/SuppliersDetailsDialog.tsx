"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PaymentBadge } from "./PurchasesTable";
import { DueLabel } from "./SuppliersTable";
import { SUPPLIER_HISTORY_LIMIT } from "@/config/owner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDay } from "@/utils/localDate";
import type { Purchase, SupplierRow } from "@/types/owner";

type Props = {
  supplier: SupplierRow | null; // null = closed
  purchases: Purchase[]; // this supplier's purchases, newest first
  scopeLabel: string | null; // store name when the store filter is on
  onClose: () => void;
};

const TH = "px-4 py-2.5 text-left text-xs font-semibold text-gray-600";

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function SupplierDetailsDialog({ supplier, purchases, scopeLabel, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (supplier && !dialog.open) dialog.showModal();
    if (!supplier && dialog.open) dialog.close();
  }, [supplier]);

  const shown = purchases.slice(0, SUPPLIER_HISTORY_LIMIT);

  return (
    <dialog
      ref={ref}
      aria-labelledby="supplier-details-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {supplier && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="supplier-details-title" className="text-lg font-semibold text-black">
                {supplier.name}
              </h2>
              <p className="mt-1 text-sm text-gray-600">Contact: {supplier.contactPerson}</p>
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
                <a href={`tel:${supplier.phone.replace(/\s/g, "")}`} className="underline-offset-2 hover:underline">
                  {supplier.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Email</dt>
              <dd className="mt-1 break-all text-sm font-medium text-black">
                <a href={`mailto:${supplier.email}`} className="underline-offset-2 hover:underline">
                  {supplier.email}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Address</dt>
              <dd className="mt-1 text-sm font-medium text-black">{supplier.address}</dd>
            </div>
          </dl>

          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-300 p-4">
              <dt className="text-xs text-gray-500">Purchases</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-black">{supplier.purchaseCount}</dd>
            </div>
            <div className="rounded-xl border border-gray-300 p-4">
              <dt className="text-xs text-gray-500">Total purchased</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-black">
                {formatCurrency(supplier.totalPurchased)}
              </dd>
            </div>
            <div className="rounded-xl border border-gray-300 p-4">
              <dt className="text-xs text-gray-500">Payment due</dt>
              <dd className="mt-1 text-lg tabular-nums">
                <DueLabel amount={supplier.amountDue} />
              </dd>
            </div>
          </dl>

          <h3 className="mt-6 text-[15px] font-semibold text-black">Purchase history</h3>
          {scopeLabel && <p className="mt-1 text-[13px] text-gray-600">Showing purchases at {scopeLabel} only.</p>}

          {purchases.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-600">
              No purchases from this supplier{scopeLabel ? " at this store" : ""} yet.
            </p>
          ) : (
            <>
              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-300">
                <table className="w-full min-w-[560px] text-sm">
                  <caption className="sr-only">Purchases from {supplier.name}</caption>
                  <thead className="border-b border-gray-300 bg-gray-50">
                    <tr>
                      <th scope="col" className={TH}>Purchase</th>
                      <th scope="col" className={TH}>Store</th>
                      <th scope="col" className={TH}>Items</th>
                      <th scope="col" className={`${TH} text-right`}>Total</th>
                      <th scope="col" className={TH}>Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shown.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-black">{p.referenceNo}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{formatDay(p.purchaseDate)}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-900">{p.storeName}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {p.items.length} {p.items.length === 1 ? "item" : "items"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-black">
                          {formatCurrency(p.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <PaymentBadge status={p.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {purchases.length > shown.length && (
                <p className="mt-2 text-[13px] text-gray-600">
                  Showing the latest {shown.length} of {purchases.length} purchases. Open Purchases to see them all.
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