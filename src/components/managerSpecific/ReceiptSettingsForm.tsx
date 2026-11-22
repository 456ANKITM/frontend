"use client";

import { useState, type ChangeEvent } from "react";
import { Hash, Loader2, Store } from "lucide-react";
import TextField from "@/components/common/TextField";
import FieldError from "@/components/common/FieldError";
import type { ToastState } from "@/components/ui/Toast";
import { card, outlineBtn, primaryBtn } from "./managerSettingsStyles";
import { ManagerSettingsApiError, updateReceiptSettings } from "@/dummy/managerSettings";
import { INVOICE_PREFIX_MAX, RECEIPT_FOOTER_MAX } from "@/config/managerSettings";
import { validateReceipt, type ReceiptErrors } from "@/utils/managerSettings";
import { formatCurrency } from "@/utils/formatCurrency";
import type { ReceiptSettings } from "@/types/managerSettings";

type Props = {
  saved: ReceiptSettings | null; // null = no store assigned yet
  onSaved: (receipt: ReceiptSettings) => void;
  onNotify: (toast: ToastState) => void;
};

const SAMPLE = [
  { name: "Basmati Rice 5kg", qty: 1, price: 890 },
  { name: "Tea Leaves 250g", qty: 2, price: 185 },
];

export default function ReceiptSettingsForm({ saved, onSaved, onNotify }: Props) {
  const [draft, setDraft] = useState({
    invoicePrefix: saved?.invoicePrefix ?? "INV",
    receiptFooter: saved?.receiptFooter ?? "",
  });
  const [errors, setErrors] = useState<ReceiptErrors>({});
  const [saving, setSaving] = useState(false);

  if (!saved) {
    return (
      <section aria-labelledby="receipt-title" className={card}>
        <h2 id="receipt-title" className="text-[15px] font-semibold text-black">
          Receipt settings
        </h2>
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-700">
          <Store className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          You are not assigned to a store yet. Once your owner assigns you one, you can set its invoice prefix and
          receipt footer here.
        </p>
      </section>
    );
  }

  const values = { invoicePrefix: draft.invoicePrefix.trim().toUpperCase(), receiptFooter: draft.receiptFooter.trim() };
  const dirty = values.invoicePrefix !== saved.invoicePrefix || values.receiptFooter !== saved.receiptFooter;
  const subtotal = SAMPLE.reduce((s, l) => s + l.qty * l.price, 0);
  const previewPrefix = values.invoicePrefix || "INV";

  const discard = () => {
    setDraft({ invoicePrefix: saved.invoicePrefix, receiptFooter: saved.receiptFooter });
    setErrors({});
  };

  const handleSubmit = async () => {
    const found = validateReceipt(values);
    setErrors(found);
    if (found.invoicePrefix) return document.getElementById("invoice-prefix")?.focus();
    if (found.receiptFooter) return document.getElementById("receipt-footer")?.focus();

    setSaving(true);
    try {
      const receipt = await updateReceiptSettings(values);
      onSaved(receipt);
      setDraft({ invoicePrefix: receipt.invoicePrefix, receiptFooter: receipt.receiptFooter });
      onNotify({ type: "success", message: "Receipt settings saved." });
    } catch (err) {
      if (err instanceof ManagerSettingsApiError && err.fieldErrors) setErrors(err.fieldErrors as ReceiptErrors);
      onNotify({ type: "error", message: "We couldn't save the receipt settings. Check the form and try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      noValidate
      aria-labelledby="receipt-title"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className={card}
    >
      <h2 id="receipt-title" className="text-[15px] font-semibold text-black">
        Receipt settings
      </h2>
      <p className="mt-1 text-sm text-gray-600">How invoices and receipts look at {saved.storeName}.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <TextField
            label="Invoice prefix"
            name="invoice-prefix"
            icon={Hash}
            value={draft.invoicePrefix}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setDraft((d) => ({ ...d, invoicePrefix: e.target.value }));
              setErrors((p) => ({ ...p, invoicePrefix: undefined }));
            }}
            error={errors.invoicePrefix}
            hint="Shown before the invoice number, for example INV-1042. Letters and numbers only."
            maxLength={INVOICE_PREFIX_MAX}
            autoComplete="off"
          />

          <div>
            <label htmlFor="receipt-footer" className="mb-1.5 flex items-center justify-between text-sm font-medium text-black">
              <span>Receipt footer</span>
              <span className="text-xs font-normal text-gray-500">Optional</span>
            </label>
            <textarea
              id="receipt-footer"
              rows={3}
              value={draft.receiptFooter}
              maxLength={RECEIPT_FOOTER_MAX}
              onChange={(e) => {
                setDraft((d) => ({ ...d, receiptFooter: e.target.value }));
                setErrors((p) => ({ ...p, receiptFooter: undefined }));
              }}
              aria-invalid={errors.receiptFooter ? true : undefined}
              aria-describedby={errors.receiptFooter ? "receipt-footer-error" : "receipt-footer-hint"}
              placeholder="e.g. Goods once sold can be exchanged within 7 days."
              className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-[15px] text-black outline-none transition placeholder:text-gray-400 focus:ring-4 ${
                errors.receiptFooter
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                  : "border-gray-300 focus:border-black focus:ring-black/10"
              }`}
            />
            <p id="receipt-footer-hint" className="mt-1 text-xs text-gray-500">
              {draft.receiptFooter.length} of {RECEIPT_FOOTER_MAX} characters.
            </p>
            <FieldError id="receipt-footer-error" message={errors.receiptFooter} />
          </div>

          <p className="text-[13px] text-gray-600">
            Invoices you already issued keep the prefix they were created with.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-black">Preview</p>
          <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 text-[13px] text-gray-800" aria-label="Receipt preview" role="group">
            <p className="text-center text-sm font-semibold text-black">{saved.storeName}</p>
            <p className="text-center text-gray-600">{saved.storeLocation}</p>
            {saved.storePhone && <p className="text-center text-gray-600">{saved.storePhone}</p>}
            <p className="mt-3 border-t border-dashed border-gray-400 pt-3 font-medium text-black">{previewPrefix}-1042</p>
            <ul className="mt-2 space-y-1">
              {SAMPLE.map((l) => (
                <li key={l.name} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    {l.qty} x {l.name}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatCurrency(l.qty * l.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t border-dashed border-gray-400 pt-2 font-semibold text-black">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </p>
            {values.receiptFooter && (
              <p className="mt-3 whitespace-pre-line border-t border-dashed border-gray-400 pt-3 text-center text-gray-600">
                {values.receiptFooter}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!dirty || saving} aria-busy={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {saving ? "Saving..." : "Save receipt settings"}
        </button>
        {dirty && !saving && (
          <>
            <button type="button" onClick={discard} className={outlineBtn}>
              Discard changes
            </button>
            <p className="text-[13px] text-gray-600">You have unsaved changes.</p>
          </>
        )}
      </div>
    </form>
  );
}