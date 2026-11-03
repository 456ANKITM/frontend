import type { ReactNode } from "react";
import { Mail, Phone, UserCog, UserPlus } from "lucide-react";
import { StoreStatusPill } from "./StoreBadges";
import type { OwnerStore, StoreManager } from "@/types/owner";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd className="text-right text-sm font-medium text-black">{children}</dd>
    </div>
  );
}

export function StoreInfoCard({ store }: { store: OwnerStore }) {
  return (
    <section aria-labelledby="store-info-title" className="rounded-xl border border-gray-300 bg-white p-5">
      <h2 id="store-info-title" className="text-[15px] font-semibold text-black">
        Store information
      </h2>
      <dl className="mt-2 divide-y divide-gray-200">
        <Row label="Status">
          <StoreStatusPill status={store.status} />
        </Row>
        <Row label="Location">{store.location}</Row>
        <Row label="Contact phone">{store.contactPhone || <span className="font-normal text-gray-500">Not added</span>}</Row>
        <Row label="Opened">{formatDate(store.createdAt)}</Row>
      </dl>
    </section>
  );
}

type ManagerProps = { manager: StoreManager | null; onAssign: () => void };

export function ManagerCard({ manager, onAssign }: ManagerProps) {
  const initials = manager?.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <section aria-labelledby="manager-title" className="rounded-xl border border-gray-300 bg-white p-5">
      <h2 id="manager-title" className="text-[15px] font-semibold text-black">
        Store Manager
      </h2>

      {manager ? (
        <>
          <div className="mt-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-black">{manager.name}</p>
              <p className="text-xs text-gray-500">Runs this store day to day</p>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            <li>
              <a
                href={`mailto:${manager.email}`}
                className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black transition hover:border-black"
              >
                <Mail className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                <span className="truncate">{manager.email}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${manager.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black transition hover:border-black"
              >
                <Phone className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                {manager.phone}
              </a>
            </li>
          </ul>
        </>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm leading-relaxed text-gray-600">
          No Store Manager is assigned yet. Assign one so this store can record sales and manage stock.
        </p>
      )}

      <button
        type="button"
        onClick={onAssign}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
      >
        {manager ? <UserCog className="h-4 w-4" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
        {manager ? "Change manager" : "Assign manager"}
      </button>
    </section>
  );
}