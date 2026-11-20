"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ChevronDown, Loader2, Plus, Trash2, X } from "lucide-react";
import { createPurchase } from "@/dummy/ownerPurchases";
import { formatCurrency } from "@/utils/formatCurrency";
import { todayLocal } from "@/utils/localDate";
import type { PaymentStatus, ProductOption, Purchase, StoreOption, SupplierOption } from "@/types/owner";

type Row = { key: string; productId: string; quantity: string; costPrice: string };
type RowErrors = { productId?: string; quantity?: string; costPrice?: string };
type TopErrors = Partial<Record<"storeId" | "supplierId" | "purchaseDate" | "items", string>>;

let rowSeq = 0;
const newRow = (): Row => ({ key: `row-${++rowSeq}`, productId: "", quantity: "", costPrice: "" });
const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

const control = (invalid: boolean) =>
  `h-10 w-full rounded-xl border bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10 ${
    invalid ? "border-black" : "border-gray-300"
  }`;

const COLS = "sm:grid-cols-[minmax(0,1fr)_88px_112px_112px_36px]";
const ROW = `grid grid-cols-2 gap-3 ${COLS} sm:items-start`;

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-black">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-black">
        {label} {hint && <span className="font-normal text-gray-500">({hint})</span>}
      </label>
      {children}
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

function Select({ id, value, onChange, invalid, describedBy, children }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; describedBy?: string; children: ReactNode }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={`${control(!!invalid)} appearance-none pr-9`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
    </div>
  );
}

type Props = {
  open: boolean;
  stores: StoreOption[];
  suppliers: SupplierOption[];
  products: ProductOption[];
  defaultStoreId: string; // "" when no single store is selected in the filters
  onClose: () => void;
  onCreated: (purchase: Purchase) => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function NewPurchaseDialog({ open, stores, suppliers, products, defaultStoreId, onClose, onCreated }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [storeId, setStoreId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(todayLocal());
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [top, setTop] = useState<TopErrors>({});
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStoreId(defaultStoreId);
      setSupplierId("");
      setPurchaseDate(todayLocal());
      setPaymentStatus("paid");
      setRows([newRow()]);
      setTop({});
      setRowErrors({});
      setFormError(null);
      dialog.showModal();
      document.getElementById("purchase-storeId")?.focus();
    }
    if (!open && dialog.open) dialog.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const storeProducts = useMemo(() => products.filter((p) => p.storeId === storeId), [products, storeId]);
  const total = rows.reduce((sum, r) => {
    const q = num(r.quantity);
    const c = num(r.costPrice);
    return q > 0 && c >= 0 ? sum + q * c : sum;
  }, 0);

  const changeStore = (id: string) => {
    setStoreId(id);
    setRows([newRow()]); // products belong to a store, so the lines start over
    setRowErrors({});
    setTop((t) => ({ ...t, storeId: undefined, items: undefined }));
  };

  const patchRow = (key: string, patch: Partial<Row>, clear: keyof RowErrors) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setRowErrors((prev) => ({ ...prev, [key]: { ...prev[key], [clear]: undefined } }));
  };

  const pickProduct = (key: string, productId: string) => {
    const p = storeProducts.find((x) => x.id === productId);
    patchRow(key, { productId, costPrice: p ? String(p.costPrice) : "" }, "productId");
  };

  const validate = () => {
    const t: TopErrors = {};
    const re: Record<string, RowErrors> = {};
    if (!storeId) t.storeId = "Choose the store receiving this stock.";
    if (!supplierId) t.supplierId = "Choose the supplier.";
    if (!purchaseDate) t.purchaseDate = "Enter the purchase date.";
    else if (purchaseDate > todayLocal()) t.purchaseDate = "The purchase date can't be in the future.";
    if (rows.length === 0) t.items = "Add at least one item.";
    rows.forEach((r) => {
      const e: RowErrors = {};
      if (!r.productId) e.productId = "Choose a product.";
      const q = num(r.quantity);
      if (!Number.isInteger(q) || q < 1) e.quantity = "Whole number, 1 or more.";
      if (!(num(r.costPrice) >= 0)) e.costPrice = "Enter the unit cost.";
      if (Object.keys(e).length) re[r.key] = e;
    });
    return { t, re };
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);

    const { t, re } = validate();
    setTop(t);
    setRowErrors(re);

    const firstTop = (["storeId", "supplierId", "purchaseDate"] as const).find((k) => t[k]);
    if (firstTop) return void document.getElementById(`purchase-${firstTop}`)?.focus();
    const firstRow = rows.find((r) => re[r.key]);
    if (firstRow) {
      const f = (["productId", "quantity", "costPrice"] as const).find((k) => re[firstRow.key]?.[k]);
      return void document.getElementById(`purchase-${firstRow.key}-${f}`)?.focus();
    }
    if (t.items) return;

    setBusy(true);
    try {
      onCreated(
        await createPurchase({
          storeId,
          supplierId,
          purchaseDate,
          paymentStatus,
          items: rows.map((r) => ({ productId: r.productId, quantity: num(r.quantity), costPrice: num(r.costPrice) })),
        }),
      );
    } catch {
      setFormError("Couldn't record the purchase. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const used = new Set(rows.map((r) => r.productId).filter(Boolean));

  return (
    <dialog
      ref={ref}
      aria-labelledby="new-purchase-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={submit} noValidate className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="new-purchase-title" className="text-lg font-semibold text-black">
              New purchase
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Record stock received from a supplier. The quantities are added to the store&apos;s inventory.
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field id="purchase-storeId" label="Store" error={top.storeId}>
            <Select id="purchase-storeId" value={storeId} onChange={changeStore} invalid={!!top.storeId} describedBy={top.storeId ? "purchase-storeId-error" : undefined}>
              <option value="">Choose a store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.status === "inactive" ? " (inactive)" : ""}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="purchase-supplierId" label="Supplier" error={top.supplierId}>
            <Select id="purchase-supplierId" value={supplierId} onChange={(v) => { setSupplierId(v); setTop((t) => ({ ...t, supplierId: undefined })); }} invalid={!!top.supplierId} describedBy={top.supplierId ? "purchase-supplierId-error" : undefined}>
              <option value="">Choose a supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="purchase-purchaseDate" label="Purchase date" error={top.purchaseDate}>
            <input
              id="purchase-purchaseDate"
              type="date"
              max={todayLocal()}
              value={purchaseDate}
              onChange={(e) => { setPurchaseDate(e.target.value); setTop((t) => ({ ...t, purchaseDate: undefined })); }}
              aria-invalid={top.purchaseDate ? true : undefined}
              aria-describedby={top.purchaseDate ? "purchase-purchaseDate-error" : undefined}
              className={control(!!top.purchaseDate)}
            />
          </Field>

          <Field id="purchase-paymentStatus" label="Payment status">
            <Select id="purchase-paymentStatus" value={paymentStatus} onChange={(v) => setPaymentStatus(v as PaymentStatus)}>
              <option value="paid">Paid</option>
              <option value="partial">Partially paid</option>
              <option value="due">Payment due</option>
            </Select>
          </Field>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-black">Items</legend>
          <p className="mt-0.5 text-[13px] text-gray-600">
            {storeId ? "Add each product you received, with its quantity and unit cost." : "Choose a store first to see its products."}
          </p>

          <div className={`mt-3 hidden gap-3 text-xs font-semibold text-gray-600 sm:grid ${COLS}`} aria-hidden="true">
            <span>Product</span>
            <span>Quantity</span>
            <span>Unit cost</span>
            <span className="text-right">Line total</span>
            <span />
          </div>

          <ul className="mt-2 space-y-3">
            {rows.map((r, i) => {
              const err = rowErrors[r.key] ?? {};
              const q = num(r.quantity);
              const c = num(r.costPrice);
              const product = storeProducts.find((p) => p.id === r.productId);
              return (
                <li key={r.key} className={`${ROW} rounded-xl border border-gray-200 p-3 sm:border-0 sm:p-0`}>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`purchase-${r.key}-productId`} className="mb-1 block text-xs font-medium text-gray-700 sm:sr-only">
                      Product {i + 1}
                    </label>
                    <Select
                      id={`purchase-${r.key}-productId`}
                      value={r.productId}
                      onChange={(v) => pickProduct(r.key, v)}
                      invalid={!!err.productId}
                      describedBy={err.productId ? `purchase-${r.key}-productId-error` : undefined}
                    >
                      <option value="">{storeId ? "Choose a product" : "Choose a store first"}</option>
                      {storeProducts.map((p) => (
                        <option key={p.id} value={p.id} disabled={used.has(p.id) && p.id !== r.productId}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </Select>
                    {err.productId && <ErrorText id={`purchase-${r.key}-productId-error`}>{err.productId}</ErrorText>}
                  </div>

                  <div>
                    <label htmlFor={`purchase-${r.key}-quantity`} className="mb-1 block text-xs font-medium text-gray-700 sm:sr-only">
                      Quantity{product ? ` (${product.unit})` : ""}
                    </label>
                    <input
                      id={`purchase-${r.key}-quantity`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={r.quantity}
                      onChange={(e) => patchRow(r.key, { quantity: e.target.value }, "quantity")}
                      placeholder={product ? product.unit : "Qty"}
                      aria-invalid={err.quantity ? true : undefined}
                      aria-describedby={err.quantity ? `purchase-${r.key}-quantity-error` : undefined}
                      className={control(!!err.quantity)}
                    />
                    {err.quantity && <ErrorText id={`purchase-${r.key}-quantity-error`}>{err.quantity}</ErrorText>}
                  </div>

                  <div>
                    <label htmlFor={`purchase-${r.key}-costPrice`} className="mb-1 block text-xs font-medium text-gray-700 sm:sr-only">
                      Unit cost (Rs)
                    </label>
                    <input
                      id={`purchase-${r.key}-costPrice`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      value={r.costPrice}
                      onChange={(e) => patchRow(r.key, { costPrice: e.target.value }, "costPrice")}
                      placeholder="Rs"
                      aria-invalid={err.costPrice ? true : undefined}
                      aria-describedby={err.costPrice ? `purchase-${r.key}-costPrice-error` : undefined}
                      className={control(!!err.costPrice)}
                    />
                    {err.costPrice && <ErrorText id={`purchase-${r.key}-costPrice-error`}>{err.costPrice}</ErrorText>}
                  </div>

                  <div className="flex h-10 items-center justify-between sm:justify-end">
                    <span className="text-xs text-gray-600 sm:hidden">Line total</span>
                    <output className="text-sm font-medium tabular-nums text-black" aria-label={`Line total for item ${i + 1}`}>
                      {q > 0 && c >= 0 ? formatCurrency(q * c) : "-"}
                    </output>
                  </div>

                  <div className="flex h-10 items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((x) => x.key !== r.key) : [newRow()]))}
                      aria-label={`Remove item ${i + 1}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 outline-none transition hover:bg-gray-100 hover:text-black focus-visible:ring-4 focus-visible:ring-black/20"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, newRow()])}
            disabled={!storeId}
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
          {top.items && <ErrorText id="purchase-items-error">{top.items}</ErrorText>}
        </fieldset>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
          <span className="text-sm font-medium text-black">Total</span>
          <span className="text-lg font-semibold tabular-nums text-black" aria-live="polite">
            {formatCurrency(total)}
          </span>
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
          <button type="submit" disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Record purchase
          </button>
        </div>
      </form>
    </dialog>
  );
}