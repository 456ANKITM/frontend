"use client";

import type { ReactNode } from "react";
import { ChevronDown, Store } from "lucide-react";
import FieldError from "@/components/common/FieldError";
import { GROUP_OPTIONS, RANGE_PRESETS, REPORT_TYPES, TOP_BY_OPTIONS } from "@/config/reports";
import { MANAGER_REPORT_OPTIONS } from "@/config/managerReports";
import { todayLocal } from "@/utils/localDate";
import { rangeForPreset } from "@/utils/reports";
import type { FilterErrors, GroupBy, RangePreset, ReportFilters, TopBy } from "@/types/reports";

type Props = {
  value: ReportFilters;
  storeName: string;
  errors: FilterErrors;
  dirty: boolean;
  onChange: (patch: Partial<ReportFilters>) => void;
  onSubmit: () => void;
};

const inputClass =
  "h-10 w-full rounded-xl border bg-white px-4 text-sm text-black outline-none transition focus:ring-4";
const okClass = "border-gray-300 focus:border-black focus:ring-black/10";
const badClass = "border-red-500 focus:border-red-500 focus:ring-red-500/15";

function FormSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-black">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} ${okClass} appearance-none pr-10`}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// Same as the Owner's builder, without the store chips (a manager only has one store)
// and with the three reports a Store Manager can run.
export default function ManagerReportBuilderForm({ value, storeName, errors, dirty, onChange, onSubmit }: Props) {
  const current = REPORT_TYPES.find((t) => t.value === value.type) ?? MANAGER_REPORT_OPTIONS[0];
  const today = todayLocal();

  const changePreset = (preset: RangePreset) =>
    onChange(preset === "custom" ? { preset } : { preset, ...rangeForPreset(preset) });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5"
    >
      <fieldset>
        <legend className="text-sm font-medium text-black">Report type</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {MANAGER_REPORT_OPTIONS.map(({ value: type, label, description, icon: Icon }) => (
            <label
              key={type}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-300 bg-white p-4 transition hover:border-black has-[:checked]:border-black has-[:checked]:bg-gray-50 has-[:checked]:ring-1 has-[:checked]:ring-black has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-black/20"
            >
              <input
                type="radio"
                name="manager-report-type"
                value={type}
                checked={value.type === type}
                onChange={() => onChange({ type })}
                className="sr-only"
              />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-black">{label}</span>
                <span className="mt-0.5 block text-[13px] text-gray-600">{description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <Store className="h-4 w-4 shrink-0 text-black" aria-hidden="true" />
        <span>
          Reports cover <span className="font-medium text-black">{storeName}</span> only.
        </span>
      </p>

      {current.usesDates ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FormSelect id="manager-report-range" label="Date range" value={value.preset} onChange={(v) => changePreset(v as RangePreset)}>
            {RANGE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </FormSelect>

          <div>
            <label htmlFor="manager-report-from" className="mb-1.5 block text-sm font-medium text-black">
              From
            </label>
            <input
              id="manager-report-from"
              type="date"
              value={value.from}
              max={today}
              onChange={(e) => onChange({ from: e.target.value, preset: "custom" })}
              aria-invalid={errors.from ? true : undefined}
              aria-describedby={errors.from ? "manager-report-from-error" : undefined}
              className={`${inputClass} ${errors.from ? badClass : okClass}`}
            />
            <FieldError id="manager-report-from-error" message={errors.from} />
          </div>

          <div>
            <label htmlFor="manager-report-to" className="mb-1.5 block text-sm font-medium text-black">
              To
            </label>
            <input
              id="manager-report-to"
              type="date"
              value={value.to}
              max={today}
              onChange={(e) => onChange({ to: e.target.value, preset: "custom" })}
              aria-invalid={errors.to ? true : undefined}
              aria-describedby={errors.to ? "manager-report-to-error" : undefined}
              className={`${inputClass} ${errors.to ? badClass : okClass}`}
            />
            <FieldError id="manager-report-to-error" message={errors.to} />
          </div>

          {value.type === "sales_summary" && (
            <FormSelect id="manager-report-group" label="Group by" value={value.groupBy} onChange={(v) => onChange({ groupBy: v as GroupBy })}>
              {GROUP_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </FormSelect>
          )}

          {value.type === "top_products" && (
            <FormSelect id="manager-report-topby" label="Rank by" value={value.topBy} onChange={(v) => onChange({ topBy: v as TopBy })}>
              {TOP_BY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FormSelect>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Inventory valuation shows the stock you have today, so there is no date range to choose.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
        >
          Generate report
        </button>
        {dirty && <p className="text-[13px] text-gray-600">You changed the options. Generate the report to update it.</p>}
      </div>
    </form>
  );
}