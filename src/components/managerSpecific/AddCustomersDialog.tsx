"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { createManagerCustomer, ManagerCustomersApiError } from "@/dummy/managerCustomers";
import { validateCustomer, type CustomerErrors, type CustomerValues } from "@/utils/customers";
import type { Customer } from "@/types/managerCustomers";

const FIELD_ORDER: (keyof CustomerValues)[] = ["name", "phone", "email", "address"];

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

const blank = (): CustomerValues => ({ name: "", phone: "", email: "", address: "" });

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function AddCustomerDialog({ open, onClose, onCreated }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<CustomerValues>(blank);
  const [errors, setErrors] = useState<CustomerErrors>({});
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
      document.getElementById("customer-name")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const set = (key: keyof CustomerValues) => (v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const focusFirst = (found: CustomerErrors) => {
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) document.getElementById(`customer-${first}`)?.focus();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setFormError(null);

    const trimmed: CustomerValues = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
    };
    const found = validateCustomer(trimmed);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return focusFirst(found);

    setBusy(true);
    try {
      onCreated(await createManagerCustomer(trimmed));
    } catch (err) {
      if (err instanceof ManagerCustomersApiError && err.fieldErrors) {
        setErrors(err.fieldErrors as CustomerErrors);
        focusFirst(err.fieldErrors as CustomerErrors);
      } else if (err instanceof ManagerCustomersApiError) {
        setFormError(err.message);
      } else {
        setFormError("Couldn't add the customer. Check your connection and try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const ariaFor = (k: keyof CustomerValues) => ({
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `customer-${k}-error` : undefined,
  });

  return (
    <dialog
      ref={ref}
      aria-labelledby="add-customer-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={submit} noValidate className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="add-customer-title" className="text-lg font-semibold text-black">
              Add a customer
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">The customer is added to your store.</p>
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
          <Field id="customer-name" label="Full name" error={errors.name} className="sm:col-span-2">
            <input id="customer-name" value={values.name} onChange={(e) => set("name")(e.target.value)} placeholder="e.g. Ramesh Shrestha" autoComplete="off" maxLength={80} className={control(!!errors.name)} {...ariaFor("name")} />
          </Field>

          <Field id="customer-phone" label="Phone" error={errors.phone}>
            <input id="customer-phone" type="tel" value={values.phone} onChange={(e) => set("phone")(e.target.value)} placeholder="+977 9841234567" autoComplete="off" className={control(!!errors.phone)} {...ariaFor("phone")} />
          </Field>

          <Field id="customer-email" label="Email" hint="optional" error={errors.email}>
            <input id="customer-email" type="email" value={values.email} onChange={(e) => set("email")(e.target.value)} placeholder="name@example.com" autoComplete="off" className={control(!!errors.email)} {...ariaFor("email")} />
          </Field>

          <Field id="customer-address" label="Address" hint="optional" error={errors.address} className="sm:col-span-2">
            <input id="customer-address" value={values.address} onChange={(e) => set("address")(e.target.value)} placeholder="Street, area, city" autoComplete="off" maxLength={200} className={control(!!errors.address)} {...ariaFor("address")} />
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
          <button type="submit" disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-black/70">
            {busy && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            Add customer
          </button>
        </div>
      </form>
    </dialog>
  );
}