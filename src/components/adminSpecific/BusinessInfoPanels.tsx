import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { PLAN_LABEL } from "@/config/admin";
import type { BusinessDetailData } from "@/types/admin";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd className="text-right text-sm font-medium text-black">{children}</dd>
    </div>
  );
}

export function BusinessInfoCard({ data }: { data: BusinessDetailData }) {
  const { business } = data;
  return (
    <section aria-labelledby="info-title" className="rounded-xl border border-gray-300 bg-white p-5">
      <h2 id="info-title" className="text-[15px] font-semibold text-black">
        Business information
      </h2>
      <dl className="mt-2 divide-y divide-gray-200">
        <Row label="Status">
          <StatusBadge status={business.status} />
        </Row>
        <Row label="Plan">{PLAN_LABEL[business.plan]}</Row>
        <Row label="Stores">{business.storeCount}</Row>
        <Row label="Registered">{formatDate(business.createdAt)}</Row>
        <Row label="Address">{data.address}</Row>
        <Row label="Business phone">{data.contactPhone}</Row>
        <Row label="Business email">{data.contactEmail}</Row>
      </dl>
    </section>
  );
}

export function OwnerCard({ data }: { data: BusinessDetailData }) {
  const { business } = data;
  const initials = business.ownerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <section aria-labelledby="owner-title" className="rounded-xl border border-gray-300 bg-white p-5">
      <h2 id="owner-title" className="text-[15px] font-semibold text-black">
        Owner contact
      </h2>

      <div className="mt-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-black">{business.ownerName}</p>
          <p className="text-xs text-gray-500">
            {data.ownerLastLoginAt ? `Last signed in ${formatDateTime(data.ownerLastLoginAt)}` : "Hasn't signed in recently"}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        <li>
          <a
            href={`mailto:${business.ownerEmail}`}
            className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black transition hover:border-black"
          >
            <Mail className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            <span className="truncate">{business.ownerEmail}</span>
          </a>
        </li>
        <li>
          <a
            href={`tel:${data.ownerPhone.replace(/\s/g, "")}`}
            className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black transition hover:border-black"
          >
            <Phone className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            {data.ownerPhone}
          </a>
        </li>
      </ul>
    </section>
  );
}