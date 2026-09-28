import type { ComponentType } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  EyeOff,
  FileSpreadsheet,
  PackageCheck,
  ReceiptText,
  TrendingUp,
  X,
} from "lucide-react";
import Reveal from "@/components/HomePageSpecific/Reveal";

interface PointItem {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const BEFORE_POINTS: PointItem[] = [
  {
    icon: FileSpreadsheet,
    title: "Spreadsheets for stock",
    description:
      "Stock counts live in files that are out of date the moment someone forgets to update them.",
  },
  {
    icon: BookOpen,
    title: "Paper registers for sales",
    description:
      "Handwritten bills, no searchable invoice history, and refunds tracked from memory.",
  },
  {
    icon: EyeOff,
    title: "No view across stores",
    description:
      "Every location reports separately, so the owner waits days to see the full picture.",
  },
];

const AFTER_POINTS: PointItem[] = [
  {
    icon: PackageCheck,
    title: "Live stock",
    description:
      "Every purchase, sale and adjustment updates inventory instantly, with low-stock alerts.",
  },
  {
    icon: ReceiptText,
    title: "Fast billing",
    description:
      "Search or scan products, apply discount and tax, and print a PDF invoice in seconds.",
  },
  {
    icon: TrendingUp,
    title: "Consolidated reports",
    description:
      "Compare every store in one dashboard and export reports to PDF or Excel.",
  },
];

export default function ProblemSolution() {
  return (
    <section id="problem-solution" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            Why switch
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Stop juggling spreadsheets and paper registers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Replace scattered tools with one system that keeps stock, sales and every store in sync.
          </p>
        </Reveal>

        {/* Before / After */}
        <div className="relative mt-14 grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* BEFORE */}
          <Reveal className="h-full">
            <div className="h-full rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Before
              </span>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
                Scattered and hard to trust
              </h3>

              <ul className="mt-8 space-y-6">
                {BEFORE_POINTS.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-gray-900">{title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
                    </div>
                    <span
                      aria-label="Problem"
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Connector: down arrow on mobile */}
          <div className="flex justify-center lg:hidden" aria-hidden="true">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-md">
              <ArrowDown className="h-5 w-5" />
            </span>
          </div>

          {/* Connector: right arrow on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-black shadow-xl lg:flex"
          >
            <ArrowRight className="h-6 w-6" />
          </div>

          {/* AFTER */}
          <Reveal delay={150} className="h-full">
            <div className="relative h-full overflow-hidden rounded-3xl bg-black p-6 text-white shadow-2xl shadow-black/20 sm:p-8">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ffffff26,transparent_55%)]"
              />

              <div className="relative">
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black">
                  After
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-white">
                  One app, always up to date
                </h3>

                <ul className="mt-8 space-y-6">
                  {AFTER_POINTS.map(({ icon: Icon, title, description }) => (
                    <li key={title} className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-300">{description}</p>
                      </div>
                      <span
                        aria-label="Solved"
                        className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-black"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}