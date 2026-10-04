"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { contactFormDefaults, contactFormSchema } from "@/schema/ContactSchema";
import type { ContactFormValues } from "@/schema/ContactSchema";
import { submitContactForm } from "@/utils/SubmitContactForm";
import Toast from "@/components/ui/Toast";
import type { ToastState } from "@/components/ui/Toast";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="ml-0.5 text-gray-400">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-black placeholder:text-gray-400 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-black/10";
const inputErrorClass = "border-red-400 focus:border-red-500 focus:ring-red-100";

export default function ContactForm() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactFormDefaults,
  });

  const onSubmit = async (values: ContactFormValues) => {
    // Honeypot tripped: silently drop the submission without alerting the bot
    if (values.website) {
      reset();
      return;
    }

    try {
      await submitContactForm(values);
      setToast({ type: "success", message: "Thanks! We'll get back to you within one business day." });
      reset();
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Honeypot field: hidden from sighted users and skipped by keyboard tab order,
            but a bot filling every field will fill this one too. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required error={errors.name?.message}>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              className={`${inputClass} ${errors.name ? inputErrorClass : ""}`}
              {...register("name")}
            />
          </Field>

          <Field label="Business name" htmlFor="businessName" error={errors.businessName?.message}>
            <input
              id="businessName"
              type="text"
              autoComplete="organization"
              placeholder="Sunrise Mart"
              className={`${inputClass} ${errors.businessName ? inputErrorClass : ""}`}
              {...register("businessName")}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" required error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
              {...register("email")}
            />
          </Field>

          <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 123-4567"
              className={`${inputClass} ${errors.phone ? inputErrorClass : ""}`}
              {...register("phone")}
            />
          </Field>
        </div>

        <Field label="Number of stores" htmlFor="storeCount" error={errors.storeCount?.message}>
          <input
            id="storeCount"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="e.g. 3"
            className={`${inputClass} sm:w-48 ${errors.storeCount ? inputErrorClass : ""}`}
            {...register("storeCount")}
          />
        </Field>

        <Field label="Message" htmlFor="message" error={errors.message?.message}>
          <textarea
            id="message"
            rows={4}
            placeholder="Tell us a bit about what you're looking for..."
            className={`w-full resize-none rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-black/10 ${
              errors.message ? inputErrorClass : ""
            }`}
            {...register("message")}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send message
            </>
          )}
        </button>
      </form>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}