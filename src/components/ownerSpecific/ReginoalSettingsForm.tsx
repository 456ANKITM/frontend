"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import TextField from "@/components/common/TextField";
import FieldError from "@/components/common/FieldError";
import type { ToastState } from "@/components/ui/Toast";
import { card, outlineBtn, primaryBtn } from "./settingStyles";
import { SettingsApiError } from "@/dummy/ownerSettings";
import { CURRENCIES, currencySymbol } from "@/config/settings";
import { parseTaxRate, type RegionalErrors } from "@/utils/settings";
import type { BusinessSettings, BusinessSettingsPayload, CurrencyCode } from "@/types/settings";

type Props = {
  saved: BusinessSettings;
  onSave: (payload: BusinessSettingsPayload) => Promise<void>;
  onNotify: (toast: ToastState) => void;
};

const money = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export default function RegionalSettingsForm({ saved, onSave, onNotify }: Props) {
  const [currency, setCurrency] = useState<CurrencyCode>(saved.currency);
  const [taxText, setTaxText] = useState(String(saved.taxRate));
  const [errors, setErrors] = useState<RegionalErrors>({});
  const [saving, setSaving] = useState(false);

  const parsed = parseTaxRate(taxText);
  const dirty =
    currency !== saved.currency ||
    (parsed.value !== null ? parsed.value !== saved.taxRate : taxText.trim() !== String(saved.taxRate));

  const symbol = currencySymbol(currency);
  const exampleTax = parsed.value !== null ? (1000 * parsed.value) / 100 : null;

  const discard = () => {
    setCurrency(saved.currency);
    setTaxText(String(saved.taxRate));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (parsed.value === null) {
      setErrors({ taxRate: parsed.error });
      document.getElementById("tax-rate")?.focus();
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      await onSave({ currency, taxRate: parsed.value });
      onNotify({ type: "success", message: "Currency and tax settings saved." });
    } catch (err) {
      if (err instanceof SettingsApiError && err.fieldErrors) {
        setErrors({ currency: err.fieldErrors.currency, taxRate: err.fieldErrors.taxRate });
      }
      onNotify({ type: "error", message: "We couldn't save your currency and tax settings. Try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      noValidate
      aria-labelledby="regional-title"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className={card}
    >
      <h2 id="regional-title" className="text-[15px] font-semibold text-black">
        Currency and tax
      </h2>
      <p className="mt-1 text-sm text-gray-600">How amounts are shown, and the tax added to new sales.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currency" className="mb-1.5 block text-sm font-medium text-black">
            Currency
          </label>
          <div className="relative">
            <select
              id="currency"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as CurrencyCode);
                setErrors((prev) => ({ ...prev, currency: undefined }));
              }}
              aria-invalid={errors.currency ? true : undefined}
              aria-describedby={[errors.currency ? "currency-error" : null, "currency-hint"].filter(Boolean).join(" ")}
              className={`h-11 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-[15px] text-black outline-none transition focus:ring-4 ${
                errors.currency
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
                  : "border-gray-300 focus:border-black focus:ring-black/10"
              }`}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
          </div>
          <p id="currency-hint" className="mt-1 text-xs text-gray-500">
            Only the symbol changes. Existing amounts are not converted.
          </p>
          <FieldError id="currency-error" message={errors.currency} />
        </div>

        <TextField
          label="Tax rate (%)"
          name="tax-rate"
          type="text"
          inputMode="decimal"
          value={taxText}
          onChange={(e) => {
            setTaxText(e.target.value);
            setErrors((prev) => ({ ...prev, taxRate: undefined }));
          }}
          error={errors.taxRate}
          hint="VAT or sales tax added to new sales. Use 0 for no tax."
          autoComplete="off"
        />
      </div>

      <p className="mt-4 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        {exampleTax !== null ? (
          <>
            Example: a {symbol} 1,000 sale with {parsed.value}% tax comes to{" "}
            <span className="font-medium text-black">
              {symbol} {money(1000 + exampleTax)}
            </span>
            . Sales you already recorded keep the tax they were recorded with.
          </>
        ) : (
          <>Enter a valid tax rate to see an example.</>
        )}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!dirty || saving} aria-busy={saving} className={primaryBtn}>
          {saving && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {saving ? "Saving..." : "Save settings"}
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