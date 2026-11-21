"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ChevronDown, Loader2, TriangleAlert, X } from "lucide-react";
import { ManagerSalesApiError, refundManagerSale } from "@/dummy/managerSales";
import { REFUND_NOTE_MAX, REFUND_REASONS } from "@/config/managerSales";
import { formatCurrency } from "@/utils/formatCurrency";
import type { ManagerSale, RefundReason } from "@/types/managerSales";

const control = (invalid: boolean) =>
  `h-10 w-full rounded-xl border bg-white px-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10 ${
    invalid ? "border-black" : "border-gray-300"
  }`;

type Props = {
  sale: ManagerSale | null; // null = closed
  onClose: () => void;
  onRefunded: (sale: ManagerSale) => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function RefundSaleDialog({ sale, onClose, onRefunded }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<RefundReason>("returned");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (sale && !dialog.open) {
      setReason("returned");
      setNote("");
      setNoteError(undefined);
      setFormError(null);
      dialog.showModal();
    }
    if (!sale && dialog.open) dialog.close();
  }, [sale]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !sale) return;
    setFormError(null);

    if (reason === "other" && !note.trim()) {
      setNoteError("Add a short note to explain this refund.");
      document.getElementById("refund-note")?.focus();
      return;
    }
    if (note.trim().length > REFUND_NOTE_MAX) {
      setNoteError(`The note can be up to ${REFUND_NOTE_MAX} characters.`);
      document.getElementById("refund-note")?.focus();
      return;
    }
    setNoteError(undefined);

    setBusy(true);
    try {
      onRefunded(await refundManagerSale({ saleId: sale.id, reason, note }));
    } catch (err) {
      if (err instanceof ManagerSalesApiError && err.fieldErrors?.note) {
        setNoteError(err.fieldErrors.note);
      } else if (err instanceof ManagerSalesApiError) {
        setFormError(err.message);
      } else {
        setFormError("Couldn't process the refund. Check your connection and try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="refund-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {sale && (
        <form onSubmit={submit} noValidate className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="refund-title" className="text-lg font-semibold text-black">
                Refund {sale.invoiceNo}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {sale.customerName ?? "Walk-in customer"} &middot; total{" "}
                <span className="font-medium text-black">{formatCurrency(sale.totalAmount)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 outline-none transition hover:bg-gray-100 hover:text-black focus-visible:ring-4 focus-visible:ring-black/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-300 bg-gray-50 p-4">
            <p className="text-sm font-medium text-black">These items go back into your stock</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-800">
              {sale.items.map((it) => (
                <li key={it.productId} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">{it.productName}</span>
                  <span className="shrink-0 tabular-nums">
                    {it.quantity} {it.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {sale.paymentStatus !== "paid" && (
            <p className="mt-3 flex items-start gap-2 text-[13px] text-gray-700">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              This sale isn&apos;t fully paid, so refunding it cancels the invoice. Check what the customer has already
              paid before returning any money.
            </p>
          )}

          <div className="mt-4">
            <label htmlFor="refund-reason" className="mb-1.5 block text-sm font-medium text-black">
              Reason
            </label>
            <div className="relative">
              <select
                id="refund-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value as RefundReason);
                  setNoteError(undefined);
                }}
                className={`${control(false)} appearance-none pr-10`}
              >
                {REFUND_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="refund-note" className="mb-1.5 block text-sm font-medium text-black">
              Note {reason !== "other" && <span className="font-normal text-gray-500">(optional)</span>}
            </label>
            <input
              id="refund-note"
              value={note}
              maxLength={REFUND_NOTE_MAX}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteError(undefined);
              }}
              placeholder="e.g. Seal was broken"
              autoComplete="off"
              aria-invalid={noteError ? true : undefined}
              aria-describedby={noteError ? "refund-note-error" : undefined}
              className={control(!!noteError)}
            />
            {noteError && (
              <p id="refund-note-error" className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-black">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {noteError}
              </p>
            )}
          </div>

          <p className="mt-4 text-[13px] text-gray-600">A refund can&apos;t be undone.</p>

          {formError && (
            <p role="alert" className="mt-3 rounded-lg border border-dashed border-gray-400 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {formError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-black/70">
              {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              Refund {formatCurrency(sale.totalAmount)}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}