import {
  Bell,
  Boxes,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  UserCog,
  Users,
} from "lucide-react";
import FeatureCard from "@/components/HomePageSpecific/FeatureCard";
import type { FeatureCardProps } from "@/components/HomePageSpecific/FeatureCard";
import Reveal from "./Reveal";

const FEATURES: FeatureCardProps[] = [
  {
    icon: Boxes,
    title: "Inventory Management",
    description:
      "Manage products and categories, watch stock levels, get low-stock alerts, and adjust stock manually with a logged reason.",
  },
  {
    icon: ShoppingCart,
    title: "Sales / POS",
    description:
      "Bill customers fast with barcode search, discount and tax, multiple payment methods, PDF invoices and easy refunds.",
  },
  {
    icon: Truck,
    title: "Purchases",
    description:
      "Record stock coming from suppliers, track payment status as paid, partial or due, and let stock update automatically.",
  },
  {
    icon: Users,
    title: "Suppliers & Customers",
    description:
      "Keep supplier and customer directories with complete purchase history in one place.",
  },
  {
    icon: Store,
    title: "Multi-Store",
    description:
      "Run several stores under one business, each with its own data and a combined view for the owner.",
  },
  {
    icon: UserCog,
    title: "Staff Management",
    description:
      "Invite Store Managers, assign them to stores, and enable or disable their access whenever you need.",
  },
  {
    icon: TrendingUp,
    title: "Reports & Analytics",
    description:
      "Sales summary, inventory valuation, profit and loss, top products and store comparison, with PDF and Excel export.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Stay informed with low-stock alerts, staff invites and activity updates.",
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            Features
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Everything you need to run your stores
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            From the shelf to the checkout to the boardroom, every part of your retail operation in
            one connected system.
          </p>
        </Reveal>

        {/* Grid: 1 column mobile, 2 tablet, 4 on large desktop */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 4) * 80} className="h-full">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}