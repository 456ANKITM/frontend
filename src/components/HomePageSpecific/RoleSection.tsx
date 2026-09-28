import { Crown, Lock, Store } from "lucide-react";
import Reveal from "./Reveal";
import RoleCard from "@/components/HomePageSpecific/RoleCard";
import type { RoleCardProps } from "@/components/HomePageSpecific/RoleCard";

const ROLES: RoleCardProps[] = [
  {
    icon: Crown,
    title: "Owner",
    scope: "All stores",
    description: "For the business owner who needs the full picture across every location.",
    variant: "dark",
    capabilities: [
      "Create and manage multiple stores",
      "Invite Store Managers and assign them to stores",
      "Manage inventory, sales and purchases in any store",
      "See consolidated reports across all stores",
      "Compare store and staff performance",
      "Manage business settings and billing",
    ],
  },
  {
    icon: Store,
    title: "Store Manager",
    scope: "One store",
    description: "For the person running a single store day to day.",
    variant: "light",
    capabilities: [
      "Manage inventory and stock adjustments",
      "Bill customers at the POS and process refunds",
      "Record purchases from suppliers",
      "Manage customers and their purchase history",
      "View reports for their own store",
      "Focused view: only their own store's data",
    ],
  },
];

export default function RolesSection() {
  return (
    <section id="roles" className="scroll-mt-20 bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            Roles and access
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            The right access for every role
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Owners see the big picture while managers run their store. Everyone gets exactly what
            they need.
          </p>
        </Reveal>

        {/* Side-by-side cards */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
          {ROLES.map((role, index) => (
            <Reveal key={role.title} delay={index * 150} className="h-full">
              <RoleCard {...role} />
            </Reveal>
          ))}
        </div>

        {/* Data isolation note */}
        <Reveal delay={200} className="mt-10 flex justify-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            <Lock className="h-4 w-4 text-black" />
            Each store data is kept separate, so managers only ever see their own store.
          </p>
        </Reveal>
      </div>
    </section>
  );
}