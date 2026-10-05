"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import FieldError from "@/components/common/FieldError";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  label: string;
  error?: string;
  /** Rendered under the error, e.g. a strength indicator */
  children?: ReactNode;
};

const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { label, error, name, children, autoComplete = "new-password", ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const id = name ?? "password";
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-black">
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          {...rest}
          ref={ref}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full rounded-xl border bg-white pl-11 pr-12 text-[15px] text-black outline-none transition placeholder:text-gray-400 focus:ring-4 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
              : "border-gray-300 focus:border-black focus:ring-black/10"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 outline-none transition-colors hover:text-black focus-visible:ring-4 focus-visible:ring-black/20"
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
      <FieldError id={errorId} message={error} />
      {children}
    </div>
  );
});

export default PasswordInput;