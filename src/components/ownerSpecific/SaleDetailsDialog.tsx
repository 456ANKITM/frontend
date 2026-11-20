"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PaymentBadge } from "./PurchasesTable";
import { MethodLabel } from "./SalesTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDay, formatTime } from "@/utils/localDate";
import type { Sale } from "@/types/owner";

type Props = { sale: Sale | null; onClose: () => void }; // null = closed

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function SaleDetailsDialog({ sale, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (sale && !dialog.open) dialog.showModal();
    if (!sale && dialog.open) dialog.close();
  }, [sale]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sale-details-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {sale && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="sale-details-title" className="text-lg font-semibold text-black">
                {sale.invoiceNo}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {formatDay(sale.soldAt.slice(0, 10))} &middot; {formatTime(sale.soldAt)} &middot; sold by {sale.soldBy}
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

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Customer</dt>
              <dd className="mt-1 text-sm font-medium text-black">{sale.customerName ?? "Walk-in customer"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Store</dt>
              <dd className="mt-1 text-sm font-medium text-black">{sale.storeName}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Payment method</dt>
              <dd className="mt-1 text-sm font-medium">
                <MethodLabel method={sale.paymentMethod} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Payment status</dt>
              <dd className="mt-1">
                <PaymentBadge status={sale.paymentStatus} />
              </dd>
            </div>
          </dl>

          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-300">
            <table className="w-full min-w-[480px] text-sm">
              <caption className="sr-only">Items in {sale.invoiceNo}</caption>
              <thead className="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Product</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Quantity</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Unit price</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sale.items.map((it) => (
                  <tr key={it.productId}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black">{it.productName}</p>
                      <p className="mt-0.5 text-xs text-gray-500">SKU {it.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-black">
                      {it.quantity} <span className="text-gray-600">{it.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">{formatCurrency(it.sellingPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-black">
                      {formatCurrency(it.quantity * it.sellingPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-gray-300 bg-gray-50">
                <tr>
                  <th scope="row" colSpan={3} className="px-4 pb-1 pt-3 text-right text-sm font-normal text-gray-700">
                    Subtotal
                  </th>
                  <td className="px-4 pb-1 pt-3 text-right text-sm tabular-nums text-gray-900">
                    {formatCurrency(sale.subtotal)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" colSpan={3} className="px-4 py-1 text-right text-sm font-normal text-gray-700">
                    Discount
                  </th>
                  <td className="px-4 py-1 text-right text-sm tabular-nums text-gray-900">
                    {sale.discount > 0 ? `\u2212 ${formatCurrency(sale.discount)}` : formatCurrency(0)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" colSpan={3} className="px-4 py-1 text-right text-sm font-normal text-gray-700">
                    Tax
                  </th>
                  <td className="px-4 py-1 text-right text-sm tabular-nums text-gray-900">{formatCurrency(sale.tax)}</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <th scope="row" colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-black">
                    Total
                  </th>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-black">
                    {formatCurrency(sale.totalAmount)}
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