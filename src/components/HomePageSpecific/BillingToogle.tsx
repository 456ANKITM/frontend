export type BillingPeriod = "monthly" | "yearly";

interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  discountLabel?: string;
}

export default function BillingToggle({ value, onChange, discountLabel }: BillingToggleProps) {
  const isYearly = value === "yearly";

  return (
    <div className="inline-flex items-center gap-3">
      <div
        role="group"
        aria-label="Billing period"
        className="relative inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-1"
      >
        {/* Sliding black pill */}
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 w-23 rounded-full bg-black transition-transform duration-300 ease-out ${
            isYearly ? "translate-x-23" : "translate-x-0"
          }`}
        />

        <button
          type="button"
          onClick={() => onChange("monthly")}
          aria-pressed={!isYearly}
          className={`relative z-10 w-23 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${
            isYearly ? "text-gray-600 hover:text-black" : "text-white"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange("yearly")}
          aria-pressed={isYearly}
          className={`relative z-10 w-23 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${
            isYearly ? "text-white" : "text-gray-600 hover:text-black"
          }`}
        >
          Yearly
        </button>
      </div>

      {discountLabel && (
        <span className="hidden rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 sm:inline-flex">
          {discountLabel}
        </span>
      )}
    </div>
  );
}