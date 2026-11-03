"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { createStore, StoreApiError } from "@/dummy/ownerStores";
import type { NewStoreInput, OwnerStore } from "@/types/owner";

type Errors = Partial<Record<keyof NewStoreInput, string>>;

const EMPTY: NewStoreInput = { name: "", location: "", contactPhone: "" };
const PHONE = /^[+()\d\s-]{7,20}$/;

function validate(v: NewStoreInput): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter a store name (at least 2 characters).";
  if (v.location.trim().length < 2) e.location = "Enter the store's location.";
  if (v.contactPhone.trim() && !PHONE.test(v.contactPhone.trim())) e.contactPhone = "Enter a valid phone number.";
  return e;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (store: OwnerStore) => void;
};

const inputClass = (invalid: boolean) =>
  `h-10 w-full rounded-xl border bg-white px-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10 ${
    invalid ? "border-black" : "border-gray-300"
  }`;

function Field({
  name,
  label,
  hint,
  value,
  error,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  name: keyof NewStoreInput;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  const id = `store-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-black">
        {label} {hint && <span className="font-normal text-gray-500">({hint})</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass(!!error)}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-black">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function AddStoreDialog({ open, onClose, onCreated }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<NewStoreInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setValues(EMPTY);
      setErrors({});
      setFormError(null);
      dialog.showModal();
      document.getElementById("store-name")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const set = (key: keyof NewStoreInput) => (v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);

    const found = validate(values);
    setErrors(found);
    const first = (["name", "location", "contactPhone"] as const).find((k) => found[k]);
    if (first) {
      document.getElementById(`store-${first}`)?.focus();
      return;
    }

    setBusy(true);
    try {
      onCreated(await createStore(values));
    } catch (err) {
      const fieldErrors = err instanceof StoreApiError ? err.fieldErrors : undefined;
      if (fieldErrors) {
        setErrors(fieldErrors);
        const k = (["name", "location", "contactPhone"] as const).find((key) => fieldErrors[key]);
        if (k) document.getElementById(`store-${k}`)?.focus();
      } else {
        setFormError("Couldn't add the store. Check your connection and try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="add-store-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={submit} noValidate className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-store-title" className="text-lg font-semibold text-black">
              Add a store
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              You can assign a Store Manager after the store is created.
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

        <div className="mt-5 space-y-4">
          <Field name="name" label="Store name" value={values.name} error={errors.name} onChange={set("name")} placeholder="e.g. Kathmandu Main Store" autoComplete="off" />
          <Field name="location" label="Location" value={values.location} error={errors.location} onChange={set("location")} placeholder="Area and city" autoComplete="off" />
          <Field name="contactPhone" label="Contact phone" hint="optional" type="tel" value={values.contactPhone} error={errors.contactPhone} onChange={set("contactPhone")} placeholder="+977 ..." autoComplete="off" />
        </div>

        {formError && (
          <p role="alert" className="mt-4 rounded-lg border border-dashed border-gray-400 bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {formError}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Add store
          </button>
        </div>
      </form>
    </dialog>
  );
}