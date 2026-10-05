"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import FieldError from "@/components/common/FieldError";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  label: string;
  options: string[];
  error?: string;
};

const SelectField = forwardRef<HTMLSelectElement, Props>(function SelectField(
  { label, options, error, name, ...rest },
  ref,
) {
  const id = name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-black">
        {label}
      </label>
      <div className="relative">
        <select
          {...rest}
          ref={ref}
          id={id}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-[15px] text-black outline-none transition focus:ring-4 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/15"
              : "border-gray-300 focus:border-black focus:ring-black/10"
          }`}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
});

export default SelectField;