import { Check, CheckCircle2, Clock, PauseCircle, TriangleAlert } from "lucide-react";
import { card } from "./settingStyles";
import { formatDay } from "@/utils/localDate";
import { formatPlanAmount } from "@/utils/settings";
import type { SubscriptionInfo, SubscriptionStatus, UsageItem } from "@/types/settings";

// Text + icon, never color alone.
const STATUS = {
  active: { label: "Active", icon: CheckCircle2, cls: "border-black bg-black text-white" },
  trial: { label: "Free trial", icon: Clock, cls: "border-black bg-white text-black" },
  suspended: { label: "Suspended", icon: PauseCircle, cls: "border-dashed border-gray-400 bg-white text-gray-700" },
} as const;

const DATE_LABEL: Record<SubscriptionStatus, string> = {
  active: "Next billing date",
  trial: "Trial ends on",
  suspended: "Next billing date",
};

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const { label, icon: Icon, cls } = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function UsageMeter({ item }: { item: UsageItem }) {
  const { label, used, limit } = item;
  const nf = new Intl.NumberFormat("en-IN");

  if (limit === null) {
    return (
      <li className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-black">{label}</span>
        <span className="tabular-nums text-gray-700">{nf.format(used)} &middot; Unlimited</span>
      </li>
    );
  }

  const pct = Math.min(100, Math.round((used / limit) * 100));
  const near = pct >= 90;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-black">{label}</span>
        <span className="inline-flex items-center gap-1.5 tabular-nums text-gray-700">
          {near && <TriangleAlert className="h-3.5 w-3.5 text-black" aria-hidden="true" />}
          {nf.format(used)} of {nf.format(limit)}
          {near && <span className="font-medium text-black">&middot; Near limit</span>}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        className="mt-1.5 h-2 rounded-full bg-gray-100"
      >
        <div className="h-2 rounded-full bg-black" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

export default function SubscriptionCard({ subscription: s }: { subscription: SubscriptionInfo }) {
  return (
    <section aria-labelledby="subscription-title" className={card}>
      <h2 id="subscription-title" className="text-[15px] font-semibold text-black">
        Subscription
      </h2>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-2xl font-semibold tracking-tight text-black">{s.planName} plan</p>
            <StatusBadge status={s.status} />
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-500">Price</dt>
              <dd className="mt-1 text-sm font-medium text-black">
                {formatPlanAmount(s.price, s.billingCurrency)} / {s.interval}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">{DATE_LABEL[s.status]}</dt>
              <dd className="mt-1 text-sm font-medium text-black">
                {s.nextBillingDate ? formatDay(s.nextBillingDate) : "\u2014"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Customer since</dt>
              <dd className="mt-1 text-sm font-medium text-black">{formatDay(s.memberSince)}</dd>
            </div>
          </dl>

          {s.status === "suspended" && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Your account is suspended. Contact the platform team to get it reactivated.
            </p>
          )}

          <h3 className="mt-6 text-sm font-semibold text-black">Included in your plan</h3>
          <ul className="mt-2 space-y-2">
            {s.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-800">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-black" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-black">Usage</h3>
          <ul className="mt-3 space-y-5">
            {s.usage.map((u) => (
              <UsageMeter key={u.label} item={u} />
            ))}
          </ul>
          <p className="mt-5 text-[13px] leading-relaxed text-gray-600">
            To change your plan or billing details, contact the platform team.
          </p>
        </div>
      </div>
    </section>
  );
}