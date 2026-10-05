"use client";

import Link from "next/link";
import { useFormContext } from "react-hook-form";
import FieldError from "@/components/common/FieldError";
import type { RegisterValues } from "@/schema/registerSchema";

export default function TermsConsent() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterValues>();
  const error = errors.terms?.message;

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id="terms"
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "terms-error" : undefined}
          className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-gray-300 accent-black outline-none focus-visible:ring-4 focus-visible:ring-black/20"
          {...register("terms")}
        />
        <label htmlFor="terms" className="cursor-pointer text-sm leading-snug text-gray-700">
          I agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            className="rounded font-semibold text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="rounded font-semibold text-black outline-none hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
          >
            Privacy Policy
          </Link>
          .
        </label>
      </div>
      <FieldError id="terms-error" message={error} />
    </div>
  );
}