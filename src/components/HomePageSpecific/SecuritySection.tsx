import type { ComponentType } from "react";
import { History, KeyRound, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import Reveal from "./Reveal";

interface SecurityPoint {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const SECURITY_POINTS: SecurityPoint[] = [
  {
    icon: Users,
    title: "Role-based access control",
    description:
      "Owners, Store Managers and platform admins each see only what their role allows.",
  },
  {
    icon: ShieldCheck,
    title: "Isolated business data",
    description:
      "Each business's data is kept separate from every other business on the platform.",
  },
  {
    icon: KeyRound,
    title: "Secure login",
    description:
      "Passwords are encrypted, and sessions are protected with secure login tokens.",
  },
  {
    icon: RefreshCcw,
    title: "Automated backups",
    description: "Your data is backed up automatically, so you're protected if something goes wrong.",
  },
  {
    icon: History,
    title: "Full audit trail",
    description:
      "Every stock movement — purchase, sale, adjustment or return — is logged and traceable.",
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-20 bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            Security &amp; reliability
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Built to protect your business data
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Your stock, sales and staff information are handled with the same care you would expect
            from your bank.
          </p>
        </Reveal>

        {/* Icon + text grid */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_POINTS.map((point, index) => (
            <Reveal
              key={point.title}
              delay={(index % 3) * 90}
              className={index === SECURITY_POINTS.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}
            >
              <div className="flex h-full items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-black/5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  <point.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-black">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{point.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}