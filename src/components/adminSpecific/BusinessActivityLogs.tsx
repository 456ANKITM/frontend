import { Building2, CheckCircle2, CreditCard, History, PauseCircle, Store, UserPlus, type LucideIcon } from "lucide-react";
import EmptyState from "./EmptyState";
import type { ActivityEntry, ActivityType } from "@/types/admin";

const ICONS: Record<ActivityType, LucideIcon> = {
  registered: Building2,
  store_created: Store,
  manager_invited: UserPlus,
  plan_changed: CreditCard,
  suspended: PauseCircle,
  activated: CheckCircle2,
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default function BusinessActivityLog({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section aria-labelledby="activity-title" className="rounded-xl border border-gray-300 bg-white p-5">
      <h2 id="activity-title" className="text-[15px] font-semibold text-black">
        Activity log
      </h2>

      {entries.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            compact
            icon={History}
            title="No activity yet"
            description="Sign-ups, store changes and status updates for this business will be listed here."
          />
        </div>
      ) : (
        <ol className="ml-4 mt-5 space-y-6 border-l border-gray-200">
          {entries.map((e) => {
            const Icon = ICONS[e.type];
            return (
              <li key={e.id} className="relative pl-7">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-white text-black ring-1 ring-gray-300"
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium leading-snug text-black">{e.message}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {e.actor} · <time dateTime={e.at}>{formatDateTime(e.at)}</time>
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}