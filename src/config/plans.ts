export interface PricingPlan {
  /** Used in the URL as ?plan=<id> and must stay stable once published */
  id: string;
  name: string;
  description: string;
  /** Price per store per month, in whole currency units */
  monthlyPrice: number;
  /** Price per store per month when billed yearly (usually discounted) */
  yearlyPrice: number;
  currencySymbol: string;
  features: string[];
  isPopular?: boolean;
  ctaLabel: string;
}

/**
 * PLACEHOLDER VALUES — replace with real plans before launch.
 * Prices are per store, per month.
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For a single store just getting started.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    currencySymbol: "$",
    features: [
      "1 store",
      "Inventory & POS billing",
      "Purchases & suppliers",
      "Basic sales reports",
      "Email support",
    ],
    ctaLabel: "Start Free Trial",
  },
  {
    id: "growth",
    name: "Growth",
    description: "For businesses running a few stores.",
    monthlyPrice: 39,
    yearlyPrice: 31,
    currencySymbol: "$",
    features: [
      "Up to 5 stores",
      "Everything in Starter",
      "Staff management",
      "Store comparison reports",
      "PDF & Excel export",
      "Priority support",
    ],
    isPopular: true,
    ctaLabel: "Start Free Trial",
  },
  {
    id: "scale",
    name: "Scale",
    description: "For growing multi-store businesses.",
    monthlyPrice: 79,
    yearlyPrice: 63,
    currencySymbol: "$",
    features: [
      "Unlimited stores",
      "Everything in Growth",
      "Profit & loss reports",
      "Staff performance reports",
      "Dedicated onboarding",
    ],
    ctaLabel: "Start Free Trial",
  },
];

/** Shown next to the toggle, e.g. "Save 20% with yearly billing" */
export const YEARLY_DISCOUNT_LABEL = "Save up to 20%";