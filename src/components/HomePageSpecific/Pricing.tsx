"use client";

import { useState } from "react";
import BillingToggle from "./BillingToogle";
import type { BillingPeriod } from "./BillingToogle";
import PricingCard from "./PricingCard";
import Reveal from "./Reveal";
import { PRICING_PLANS, YEARLY_DISCOUNT_LABEL } from "@/config/plans";

export default function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <section id="pricing" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            Pricing
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Simple pricing that grows with you
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Start free, then pick the plan that matches how many stores you run.
          </p>
        </Reveal>

        {/* Toggle */}
        <Reveal delay={100} className="mt-9 flex justify-center">
          <BillingToggle value={period} onChange={setPeriod} discountLabel={YEARLY_DISCOUNT_LABEL} />
        </Reveal>

        {/* Plan cards */}
        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3 lg:gap-8 lg:pt-3">
          {PRICING_PLANS.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 120} className="h-full">
              <PricingCard
                planId={plan.id}
                name={plan.name}
                description={plan.description}
                price={period === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}
                currencySymbol={plan.currencySymbol}
                period={period}
                features={plan.features}
                isPopular={plan.isPopular}
                ctaLabel={plan.ctaLabel}
              />
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Need more stores or a custom setup?{" "}
          <a href="#contact" className="font-semibold text-black hover:underline">
            Talk to us
          </a>
          .
        </p>
      </div>
    </section>
  );
}