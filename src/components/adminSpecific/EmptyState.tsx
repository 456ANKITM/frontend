import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  compact?: boolean;
  children?: ReactNode;
};

export default function EmptyState({ icon: Icon, title, description, compact, children }: Props) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center ${
        compact ? "px-4 py-8" : "px-6 py-14"
      }`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black ring-1 ring-gray-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-black">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-gray-600">{description}</p>
      {children}
    </div>
  );
}