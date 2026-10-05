"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import FieldError from "@/components/common/FieldError";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  icon?: LucideIcon;
  /** Span both columns inside a 2-column section grid */
  full?: boolean;
};

const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, optional, hint, icon: Icon, full, name, className = "", ...rest },
  ref,
) {
  const id = name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium text-black">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-gray-500">Optional</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
        )}
        <input
          {...rest}
          ref={ref}
          id={id}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`h-11 w-full rounded-xl border bg-white text-[15px] text-black outline-none transition placeholder:text-gray-400 focus:ring-4 ${
            Icon ? "pl-11 pr-4" : "px-4"
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
              : "border-gray-300 focus:border-black focus:ring-black/10"
          } ${className}`}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
});

export default TextField;