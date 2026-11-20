import { Ban, CheckCircle2, Clock, Loader2, Store } from "lucide-react";
import type { StaffStatus, StoreManager } from "@/types/owner";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

// Text + icon, never color alone.
export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const cfg = {
    active: { label: "Active", icon: CheckCircle2, cls: "border-black bg-black text-white" },
    invited: { label: "Invited", icon: Clock, cls: "border-gray-300 bg-gray-100 text-gray-900" },
    disabled: { label: "Disabled", icon: Ban, cls: "border-dashed border-gray-400 bg-white text-gray-700" },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

function Switch({ on, busy, label, onClick }: { on: boolean; busy: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border outline-none transition-colors focus-visible:ring-4 focus-visible:ring-black/20 ${
        on ? "border-black bg-black" : "border-gray-300 bg-gray-200"
      }`}
    >
      <span
        className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      >
        {busy && <Loader2 className="h-3 w-3 animate-spin text-gray-600" aria-hidden="true" />}
      </span>
    </button>
  );
}

type Props = {
  staff: StoreManager[];
  togglingId: string | null;
  onToggle: (m: StoreManager) => void;
  onChangeStore: (m: StoreManager) => void;
};

export default function StaffTable({ staff, togglingId, onToggle, onChangeStore }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[900px] text-sm">
        <caption className="sr-only">Store Managers</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Staff member</th>
            <th scope="col" className={TH}>Role</th>
            <th scope="col" className={TH}>Store</th>
            <th scope="col" className={TH}>Status</th>
            <th scope="col" className={TH}>Access</th>
            <th scope="col" className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {staff.map((m) => {
            const on = m.status === "active";
            const busy = togglingId === m.id;
            const initials = m.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
            return (
              <tr key={m.id} className="transition-colors hover:bg-gray-50">
                <td className={TD}>
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-black ring-1 ring-gray-200"
                    >
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-black">{m.name}</p>
                      <p className="truncate text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className={`${TD} text-gray-900`}>Store Manager</td>
                <td className={TD}>
                  {m.storeName ? (
                    <span className="inline-flex items-center gap-1.5 text-black">
                      <Store className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                      {m.storeName}
                    </span>
                  ) : (
                    <span className="text-gray-500">Unassigned</span>
                  )}
                </td>
                <td className={TD}>
                  <StaffStatusBadge status={m.status} />
                </td>
                <td className={TD}>
                  {m.status === "invited" ? (
                    <span className="text-xs text-gray-500">Waiting for them to accept</span>
                  ) : (
                    <span className="inline-flex items-center gap-2.5">
                      <Switch
                        on={on}
                        busy={busy}
                        onClick={() => onToggle(m)}
                        label={`${on ? "Disable" : "Enable"} access for ${m.name}`}
                      />
                      <span className="text-xs text-gray-700">{on ? "Enabled" : "Disabled"}</span>
                    </span>
                  )}
                </td>
                <td className={`${TD} text-right`}>
                  <button
                    type="button"
                    onClick={() => onChangeStore(m)}
                    aria-label={`Change store for ${m.name}`}
                    className="inline-flex h-8 items-center rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
                  >
                    {m.storeName ? "Change store" : "Assign store"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StaffTableSkeleton({ rows = 6 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white" role="status" aria-label="Loading staff">
      <table className="w-full min-w-[900px] text-sm" aria-hidden="true">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {["Staff member", "Role", "Store", "Status", "Access", "Actions"].map((h) => (
              <th key={h} className={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={TD}>
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${bar}`} />
                  <div>
                    <div className={`h-3.5 w-28 ${bar}`} />
                    <div className={`mt-2 h-3 w-40 ${bar}`} />
                  </div>
                </div>
              </td>
              <td className={TD}><div className={`h-3.5 w-24 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-32 ${bar}`} /></td>
              <td className={TD}><div className={`h-6 w-20 rounded-full ${bar}`} /></td>
              <td className={TD}><div className={`h-6 w-24 rounded-full ${bar}`} /></td>
              <td className={`${TD} text-right`}><div className={`ml-auto h-8 w-24 rounded-lg ${bar}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}