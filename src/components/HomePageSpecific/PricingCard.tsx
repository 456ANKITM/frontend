import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  currencySymbol: string;
  period: "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
  ctaLabel: string;
  /** Plan id passed to /register?plan=<planId> so it can be pre-selected */
  planId: string;
}

export default function PricingCard({
  name,
  description,
  price,
  currencySymbol,
  period,
  features,
  isPopular = false,
  ctaLabel,
  planId,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl p-6 transition-transform duration-300 sm:p-8 ${
        isPopular
          ? "bg-black text-white shadow-2xl shadow-black/20 lg:-translate-y-3 lg:scale-105"
          : "border border-gray-200 bg-white text-black hover:-translate-y-1 hover:shadow-lg"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-black shadow-md">
          Most Popular
        </span>
      )}

      <h3 className={`text-lg font-bold tracking-tight ${isPopular ? "text-white" : "text-black"}`}>
        {name}
      </h3>
      <p className={`mt-1.5 text-sm ${isPopular ? "text-gray-300" : "text-gray-600"}`}>
        {description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className={`text-4xl font-bold tracking-tight ${isPopular ? "text-white" : "text-black"}`}>
          {currencySymbol}
          {price}
        </span>
        <span className={`text-sm font-medium ${isPopular ? "text-gray-400" : "text-gray-500"}`}>
          / store / mo
        </span>
      </div>
      {period === "yearly" && (
        <p className={`mt-1 text-xs ${isPopular ? "text-gray-400" : "text-gray-500"}`}>
          Billed yearly
        </p>
      )}

      <Link
        href={`/register?plan=${planId}`}
        className={`group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 ${
          isPopular
            ? "bg-white text-black hover:bg-gray-100"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>

      <hr className={`my-7 ${isPopular ? "border-white/15" : "border-gray-200"}`} />

      <ul className="space-y-3.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                isPopular ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={3.5} />
            </span>
            <span className={isPopular ? "text-gray-200" : "text-gray-700"}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}