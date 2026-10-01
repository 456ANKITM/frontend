import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Package,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import ReportsChart from "./ReportsCharts";
import Reveal from "./Reveal";

interface ReportType {
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const REPORT_TYPES: ReportType[] = [
  { icon: TrendingUp, label: "Sales summary" },
  { icon: Package, label: "Inventory valuation" },
  { icon: Wallet, label: "Profit & loss" },
  { icon: Trophy, label: "Top products" },
  { icon: BarChart3, label: "Store comparison" },
  { icon: Users, label: "Staff performance" },
];

export default function ReportsHighlight() {
  return (
    <section id="reports-highlight" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Chart illustration */}
          <Reveal className="order-2 lg:order-1">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-x-8 top-8 -z-10 h-2/3 rounded-full bg-gray-200/60 blur-3xl"
              />
              <ReportsChart />
            </div>
          </Reveal>

          {/* Text column */}
          <Reveal delay={150} className="order-1 lg:order-2">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700">
              Reports &amp; analytics
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Decisions backed by real numbers
            </h2>

            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              See exactly how your business is performing — by store, by product and over time —
              without pulling numbers together by hand.
            </p>

            {/* Report type list */}
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
              {REPORT_TYPES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-black">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                </li>
              ))}
            </ul>

            {/* Export options */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Export as:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-800 shadow-sm">
                <FileText className="h-3.5 w-3.5" />
                PDF
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-800 shadow-sm">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}