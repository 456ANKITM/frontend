import type { ReactNode } from "react";

type Props = {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
};

export default function FormSection({ step, title, description, children }: Props) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white"
        >
          {step}
        </span>
        <span className="text-[15px] font-semibold text-black">{title}</span>
      </legend>
      {description && <p className="mt-1 pl-8.5 text-[13px] text-gray-600">{description}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}