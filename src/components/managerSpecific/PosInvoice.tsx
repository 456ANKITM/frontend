"use client";

import { CheckCircle2, Plus, Printer } from "lucide-react";
import { PaymentBadge } from "@/components/ownerSpecific/PurchasesTable";
import { formatCurrency } from "@/utils/formatCurrency";
import type { PaymentMethod, Sale } from "@/types/owner";
import type { PosStore } from "@/types/pos";

const METHOD_LABEL: Record<PaymentMethod, string> = { cash: "Cash", card: "Card", online: "Online" };

// Prints only the invoice: everything else on the page (sidebar, header, buttons) is hidden.
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #print-invoice, #print-invoice * { visibility: visible !important; }
  #print-invoice { position: absolute; left: 0; top: 0; width: 100%; border: 0 !important; box-shadow: none !important; }
  @page { margin: 12mm; }
}`;

type Props = {
  sale: Sale;
  store: PosStore;
  taxRate: number;
  amountReceived: number | null; // cash only
  onNewSale: () => void;
};

export default function PosInvoice({ sale, store, taxRate, amountReceived, onNewSale }: Props) {
  const when = new Date(sale.soldAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const change = amountReceived !== null && amountReceived > sale.totalAmount ? amountReceived - sale.totalAmount : 0;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <style>{PRINT_CSS}</style>

      <div role="status" className="flex items-start gap-3 rounded-xl border border-gray-300 bg-white p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-black">Sale recorded: {sale.invoiceNo}</p>
          <p className="mt-0.5 text-[13px] text-gray-600">Stock was updated. Print the invoice or start the next sale.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print invoice
        </button>
        <button
          type="button"
          onClick={onNewSale}
          autoFocus
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New sale
        </button>
      </div>

      <article id="print-invoice" aria-label={`Invoice ${sale.invoiceNo}`} className="rounded-2xl border border-gray-200 bg-white p-6 text-black">
        <header className="border-b border-dashed border-gray-300 pb-4 text-center">
          <h2 className="text-lg font-semibold">{store.name}</h2>
          <p className="text-sm text-gray-600">{store.location}</p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide">Invoice {sale.invoiceNo}</p>
        </header>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-gray-600">Date</dt>
          <dd className="text-right">{when}</dd>
          <dt className="text-gray-600">Customer</dt>
          <dd className="text-right">{sale.customerName ?? "Walk-in customer"}</dd>
          <dt className="text-gray-600">Served by</dt>
          <dd className="text-right">{sale.soldBy}</dd>
        </dl>

        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Items sold</caption>
          <thead>
            <tr className="border-y border-gray-300 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <th scope="col" className="py-2 pr-2">Item</th>
              <th scope="col" className="px-2 py-2 text-right">Qty</th>
              <th scope="col" className="px-2 py-2 text-right">Price</th>
              <th scope="col" className="py-2 pl-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sale.items.map((it) => (
              <tr key={it.productId}>
                <td className="py-2 pr-2">{it.productName}</td>
                <td className="px-2 py-2 text-right tabular-nums">{it.quantity}</td>
                <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(it.sellingPrice)}</td>
                <td className="py-2 pl-2 text-right tabular-nums">{formatCurrency(it.quantity * it.sellingPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-3 space-y-1.5 border-t border-gray-300 pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd className="tabular-nums">{formatCurrency(sale.subtotal)}</dd></div>
          {sale.discount > 0 && (
            <div className="flex justify-between"><dt className="text-gray-600">Discount</dt><dd className="tabular-nums">- {formatCurrency(sale.discount)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-gray-600">Tax ({taxRate}%)</dt><dd className="tabular-nums">{formatCurrency(sale.tax)}</dd></div>
          <div className="flex items-baseline justify-between border-t border-gray-300 pt-2">
            <dt className="text-base font-semibold">Total</dt>
            <dd className="text-lg font-semibold tabular-nums">{formatCurrency(sale.totalAmount)}</dd>
          </div>
        </dl>

        <dl className="mt-3 space-y-1.5 border-t border-dashed border-gray-300 pt-3 text-sm">
          <div className="flex items-center justify-between"><dt className="text-gray-600">Paid by</dt><dd>{METHOD_LABEL[sale.paymentMethod]}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-gray-600">Payment</dt><dd><PaymentBadge status={sale.paymentStatus} /></dd></div>
          {amountReceived !== null && (
            <div className="flex justify-between"><dt className="text-gray-600">Cash received</dt><dd className="tabular-nums">{formatCurrency(amountReceived)}</dd></div>
          )}
          {change > 0 && (
            <div className="flex justify-between"><dt className="text-gray-600">Change given</dt><dd className="tabular-nums">{formatCurrency(change)}</dd></div>
          )}
        </dl>

        <p className="mt-5 border-t border-dashed border-gray-300 pt-4 text-center text-sm text-gray-600">Thank you for shopping with us.</p>
      </article>
    </div>
  );
}