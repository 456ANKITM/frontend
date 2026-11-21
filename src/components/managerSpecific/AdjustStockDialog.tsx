"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, ChevronDown, Loader2, Minus, Plus, X } from "lucide-react";
import { adjustManagerStock, ManagerInventoryApiError } from "@/dummy/managerInventory";
import { ADJUST_NOTE_MAX, ADJUST_REASONS } from "@/config/managerInventory";
import type { AdjustDirection, AdjustReason } from "@/types/managerInventory";
import type { Product } from "@/types/owner";

type Errors = Partial<Record<"quantity" | "note", string>>;

const control = (invalid: boolean) =>
  `h-10 w-full rounded-xl border bg-white px-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10 ${
    invalid ? "border-black" : "border-gray-300"
  }`;

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-black">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

type Props = {
  product: Product | null; // null = closed
  onClose: () => void;
  onAdjusted: (product: Product) => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function AdjustStockDialog({ product, onClose, onAdjusted }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [direction, setDirection] = useState<AdjustDirection>("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<AdjustReason>("correction");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (product && !dialog.open) {
      setDirection("add");
      setQuantity("");
      setReason("correction");
      setNote("");
      setErrors({});
      setFormError(null);
      dialog.showModal();
      document.getElementById("adjust-quantity")?.focus();
    }
    if (!product && dialog.open) dialog.close();
  }, [product]);

  const qty = quantity.trim() === "" ? NaN : Number(quantity);
  const validQty = Number.isInteger(qty) && qty > 0;
  const preview = product && validQty ? product.quantityInStock + (direction === "add" ? qty : -qty) : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !product) return;
    setFormError(null);

    const found: Errors = {};
    if (!validQty) found.quantity = "Enter a whole number greater than 0.";
    else if (direction === "remove" && qty > product.quantityInStock) {
      found.quantity = `You only have ${product.quantityInStock} ${product.unit} in stock.`;
    }
    if (reason === "other" && !note.trim()) found.note = "Add a short note to explain this adjustment.";
    if (note.trim().length > ADJUST_NOTE_MAX) found.note = `The note can be up to ${ADJUST_NOTE_MAX} characters.`;
    setErrors(found);
    if (found.quantity) return document.getElementById("adjust-quantity")?.focus();
    if (found.note) return document.getElementById("adjust-note")?.focus();

    setBusy(true);
    try {
      onAdjusted(await adjustManagerStock({ productId: product.id, direction, quantity: qty, reason, note }));
    } catch (err) {
      if (err instanceof ManagerInventoryApiError && err.fieldErrors) {
        setErrors(err.fieldErrors as Errors);
      } else if (err instanceof ManagerInventoryApiError) {
        setFormError(err.message);
      } else {
        setFormError("Couldn't adjust the stock. Check your connection and try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const dirBtn = (value: AdjustDirection) =>
    `flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-black/20 ${
      direction === value ? "border-black bg-black text-white" : "border-gray-300 bg-white text-black hover:border-black"
    }`;

  return (
    <dialog
      ref={ref}
      aria-labelledby="adjust-stock-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {product && (
        <form onSubmit={submit} noValidate className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="adjust-stock-title" className="text-lg font-semibold text-black">
                Adjust stock
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {product.name} &middot; currently{" "}
                <span className="font-medium text-black">
                  {product.quantityInStock} {product.unit}
                </span>
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

          <fieldset className="mt-5">
            <legend className="mb-1.5 text-sm font-medium text-black">What do you want to do?</legend>
            <div className="flex gap-3">
              <label className={dirBtn("add")}>
                <input type="radio" name="adjust-direction" value="add" checked={direction === "add"} onChange={() => setDirection("add")} className="sr-only" />
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add stock
              </label>
              <label className={dirBtn("remove")}>
                <input type="radio" name="adjust-direction" value="remove" checked={direction === "remove"} onChange={() => setDirection("remove")} className="sr-only" />
                <Minus className="h-4 w-4" aria-hidden="true" />
                Remove stock
              </label>
            </div>
          </fieldset>

          <div className="mt-4">
            <label htmlFor="adjust-quantity" className="mb-1.5 block text-sm font-medium text-black">
              Quantity <span className="font-normal text-gray-500">({product.unit})</span>
            </label>
            <input
              id="adjust-quantity"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (errors.quantity) setErrors((p) => ({ ...p, quantity: undefined }));
              }}
              placeholder="0"
              aria-invalid={errors.quantity ? true : undefined}
              aria-describedby={errors.quantity ? "adjust-quantity-error" : "adjust-preview"}
              className={control(!!errors.quantity)}
            />
            <ErrorText id="adjust-quantity-error" message={errors.quantity} />
            <p id="adjust-preview" className="mt-1.5 text-[13px] text-gray-600">
              {preview !== null ? (
                <>
                  New stock will be{" "}
                  <span className="font-medium text-black">
                    {preview} {product.unit}
                  </span>
                  .
                </>
              ) : (
                "Enter how many to add or remove."
              )}
            </p>
          </div>

          <div className="mt-4">
            <label htmlFor="adjust-reason" className="mb-1.5 block text-sm font-medium text-black">
              Reason
            </label>
            <div className="relative">
              <select
                id="adjust-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value as AdjustReason);
                  if (errors.note) setErrors((p) => ({ ...p, note: undefined }));
                }}
                className={`${control(false)} appearance-none pr-10`}
              >
                {ADJUST_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="adjust-note" className="mb-1.5 block text-sm font-medium text-black">
              Note {reason !== "other" && <span className="font-normal text-gray-500">(optional)</span>}
            </label>
            <input
              id="adjust-note"
              value={note}
              maxLength={ADJUST_NOTE_MAX}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) setErrors((p) => ({ ...p, note: undefined }));
              }}
              placeholder="e.g. Box dropped during delivery"
              autoComplete="off"
              aria-invalid={errors.note ? true : undefined}
              aria-describedby={errors.note ? "adjust-note-error" : undefined}
              className={control(!!errors.note)}
            />
            <ErrorText id="adjust-note-error" message={errors.note} />
          </div>

          {formError && (
            <p role="alert" className="mt-4 rounded-lg border border-dashed border-gray-400 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {formError}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={busy} className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-black/70">
              {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              Save adjustment
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}