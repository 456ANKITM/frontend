"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ChevronDown, Loader2, X } from "lucide-react";
import { createProduct, ProductApiError } from "@/dummy/ownerInventory";
import { PRODUCT_UNITS } from "@/config/owner";
import type { NewProductPayload, Product, ProductUnit, StoreOption } from "@/types/owner";

// The form holds raw text; it is parsed into numbers on submit.
type Values = {
  name: string;
  sku: string;
  storeId: string;
  category: string;
  unit: ProductUnit;
  costPrice: string;
  sellingPrice: string;
  quantityInStock: string;
  reorderLevel: string;
};
type Errors = Partial<Record<keyof Values, string>>;

const FIELD_ORDER: (keyof Values)[] = [
  "name", "sku", "storeId", "category", "unit", "costPrice", "sellingPrice", "quantityInStock", "reorderLevel",
];

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter the product name (at least 2 characters).";
  if (v.sku.trim().length < 2) e.sku = "Enter a SKU, for example GR-0042.";
  if (!v.storeId) e.storeId = "Choose the store that stocks this product.";
  if (!(num(v.costPrice) >= 0)) e.costPrice = "Enter the cost price (0 or more).";
  if (!(num(v.sellingPrice) >= 0)) e.sellingPrice = "Enter the selling price (0 or more).";
  if (!Number.isInteger(num(v.quantityInStock)) || num(v.quantityInStock) < 0) e.quantityInStock = "Enter a whole number, 0 or more.";
  if (!Number.isInteger(num(v.reorderLevel)) || num(v.reorderLevel) < 0) e.reorderLevel = "Enter a whole number, 0 or more.";
  return e;
}

const control = (invalid: boolean) =>
  `h-10 w-full rounded-xl border bg-white px-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10 ${
    invalid ? "border-black" : "border-gray-300"
  }`;

function Field({
  id,
  label,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-black">
        {label} {hint && <span className="font-normal text-gray-500">({hint})</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-black">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

type Props = {
  open: boolean;
  stores: StoreOption[];
  categories: string[];
  defaultStoreId: string; // "" when no single store is selected in the filters
  onClose: () => void;
  onCreated: (product: Product) => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function AddProductDialog({ open, stores, categories, defaultStoreId, onClose, onCreated }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const blank = (): Values => ({
    name: "", sku: "", storeId: defaultStoreId, category: "", unit: "pcs",
    costPrice: "", sellingPrice: "", quantityInStock: "", reorderLevel: "",
  });
  const [values, setValues] = useState<Values>(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setValues(blank());
      setErrors({});
      setFormError(null);
      dialog.showModal();
      document.getElementById("product-name")?.focus();
    }
    if (!open && dialog.open) dialog.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof Values>(key: K) => (v: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const focusFirst = (found: Errors) => {
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) document.getElementById(`product-${first}`)?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return focusFirst(found);

    const payload: NewProductPayload = {
      name: values.name,
      sku: values.sku,
      storeId: values.storeId,
      category: values.category,
      unit: values.unit,
      costPrice: num(values.costPrice),
      sellingPrice: num(values.sellingPrice),
      quantityInStock: num(values.quantityInStock),
      reorderLevel: num(values.reorderLevel),
    };

    setBusy(true);
    try {
      onCreated(await createProduct(payload));
    } catch (err) {
      const fieldErrors = err instanceof ProductApiError ? err.fieldErrors : undefined;
      if (fieldErrors) {
        setErrors(fieldErrors);
        focusFirst(fieldErrors);
      } else {
        setFormError("Couldn't add the product. Check your connection and try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const ariaFor = (k: keyof Values) => ({
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `product-${k}-error` : undefined,
  });

  return (
    <dialog
      ref={ref}
      aria-labelledby="add-product-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={submit} noValidate className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-product-title" className="text-lg font-semibold text-black">
              Add a product
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Products belong to one store. Add the same product to another store separately.
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
          <Field id="product-name" label="Product name" error={errors.name} className="sm:col-span-2">
            <input id="product-name" value={values.name} onChange={(e) => set("name")(e.target.value)} placeholder="e.g. Basmati Rice 5kg" autoComplete="off" className={control(!!errors.name)} {...ariaFor("name")} />
          </Field>

          <Field id="product-sku" label="SKU" error={errors.sku}>
            <input id="product-sku" value={values.sku} onChange={(e) => set("sku")(e.target.value)} placeholder="e.g. GR-0042" autoComplete="off" className={control(!!errors.sku)} {...ariaFor("sku")} />
          </Field>

          <Field id="product-storeId" label="Store" error={errors.storeId}>
            <div className="relative">
              <select id="product-storeId" value={values.storeId} onChange={(e) => set("storeId")(e.target.value)} className={`${control(!!errors.storeId)} appearance-none pr-10`} {...ariaFor("storeId")}>
                <option value="">Choose a store</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.status === "inactive" ? " (inactive)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            </div>
          </Field>

          <Field id="product-category" label="Category" hint="optional" error={errors.category}>
            <input id="product-category" list="product-categories" value={values.category} onChange={(e) => set("category")(e.target.value)} placeholder="Pick or type a category" autoComplete="off" className={control(!!errors.category)} {...ariaFor("category")} />
            <datalist id="product-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field id="product-unit" label="Unit">
            <div className="relative">
              <select id="product-unit" value={values.unit} onChange={(e) => set("unit")(e.target.value as ProductUnit)} className={`${control(false)} appearance-none pr-10`}>
                {PRODUCT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            </div>
          </Field>

          <Field id="product-costPrice" label="Cost price" hint="Rs per unit" error={errors.costPrice}>
            <input id="product-costPrice" type="number" inputMode="decimal" min={0} step="any" value={values.costPrice} onChange={(e) => set("costPrice")(e.target.value)} placeholder="0" className={control(!!errors.costPrice)} {...ariaFor("costPrice")} />
          </Field>

          <Field id="product-sellingPrice" label="Selling price" hint="Rs per unit" error={errors.sellingPrice}>
            <input id="product-sellingPrice" type="number" inputMode="decimal" min={0} step="any" value={values.sellingPrice} onChange={(e) => set("sellingPrice")(e.target.value)} placeholder="0" className={control(!!errors.sellingPrice)} {...ariaFor("sellingPrice")} />
          </Field>

          <Field id="product-quantityInStock" label="Opening stock" error={errors.quantityInStock}>
            <input id="product-quantityInStock" type="number" inputMode="numeric" min={0} step={1} value={values.quantityInStock} onChange={(e) => set("quantityInStock")(e.target.value)} placeholder="0" className={control(!!errors.quantityInStock)} {...ariaFor("quantityInStock")} />
          </Field>

          <Field id="product-reorderLevel" label="Reorder level" hint="alert at or below" error={errors.reorderLevel}>
            <input id="product-reorderLevel" type="number" inputMode="numeric" min={0} step={1} value={values.reorderLevel} onChange={(e) => set("reorderLevel")(e.target.value)} placeholder="0" className={control(!!errors.reorderLevel)} {...ariaFor("reorderLevel")} />
          </Field>
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
            Add product
          </button>
        </div>
      </form>
    </dialog>
  );
}