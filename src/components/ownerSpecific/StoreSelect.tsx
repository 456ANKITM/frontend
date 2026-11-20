import { ChevronDown } from "lucide-react";
import type { StoreOption } from "@/types/owner";

type Props = {
  id: string;
  label: string;
  hint?: string; // e.g. "optional"
  value: string;
  onChange: (storeId: string) => void;
  stores: StoreOption[];
  emptyLabel: string; // label of the "" option, e.g. "Assign later" / "Unassigned"
};

// Select of stores plus a note when the chosen store already has a manager.
export default function StoreSelect({ id, label, hint, value, onChange, stores, emptyLabel }: Props) {
  const chosen = stores.find((s) => s.id === value);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-black">
        {label} {hint && <span className="font-normal text-gray-500">({hint})</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={chosen?.managerName ? `${id}-note` : undefined}
          className="h-10 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
        >
          <option value="">{emptyLabel}</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.status === "inactive" ? " (inactive)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
      </div>
      {chosen?.managerName && (
        <p id={`${id}-note`} className="mt-1.5 text-[13px] text-gray-600">
          {chosen.managerName} currently manages this store and will be unassigned.
        </p>
      )}
    </div>
  );
}