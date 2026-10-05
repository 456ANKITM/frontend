"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Lock } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import { fieldInput } from "@/components/common/inputStyles";
import PasswordVisibilityToggle from "./PasswordVisiblityToogle";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
  error?: string;
  labelAction?: ReactNode; // e.g. "Forgot password?"
};

const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { error, labelAction, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const id = "password";
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          Password
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A93A6]"
          aria-hidden="true"
        />
        <input
          {...rest}
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Enter your password"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={fieldInput(Boolean(error), true)}
        />
        <PasswordVisibilityToggle
          visible={visible}
          onToggle={() => setVisible((v) => !v)}
          controls={id}
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
});

export default PasswordField;