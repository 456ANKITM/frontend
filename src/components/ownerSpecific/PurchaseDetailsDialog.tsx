"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PaymentBadge } from "./PurchasesTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDay } from "@/utils/localDate";
import type { Purchase } from "@/types/owner";

type Props = { purchase: Purchase | null; onClose: () => void }; // null = closed

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function PurchaseDetailsDialog({ purchase, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (purchase && !dialog.open) dialog.showModal();
    if (!purchase && dialog.open) dialog.close();
  }, [purchase]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="purchase-details-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {purchase && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="purchase-details-title" className="text-lg font-semibold text-black">
                {purchase.referenceNo}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {formatDay(purchase.purchaseDate)} &middot; recorded by {purchase.createdBy}
              </p>
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

          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-500">Supplier</dt>
              <dd className="mt-1 text-sm font-medium text-black">{purchase.supplierName}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Store</dt>
              <dd className="mt-1 text-sm font-medium text-black">{purchase.storeName}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Payment</dt>
              <dd className="mt-1">
                <PaymentBadge status={purchase.paymentStatus} />
              </dd>
            </div>
          </dl>

          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-300">
            <table className="w-full min-w-[480px] text-sm">
              <caption className="sr-only">Items in {purchase.referenceNo}</caption>
              <thead className="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Product</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Quantity</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Unit cost</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchase.items.map((it) => (
                  <tr key={it.productId}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black">{it.productName}</p>
                      <p className="mt-0.5 text-xs text-gray-500">SKU {it.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-black">
                      {it.quantity} <span className="text-gray-600">{it.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{formatCurrency(it.costPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-black">
                      {formatCurrency(it.quantity * it.costPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-300 bg-gray-50">
                <tr>
                  <th scope="row" colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Total
                  </th>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-black">
                    {formatCurrency(purchase.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

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