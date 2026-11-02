import { CheckCircle2, Clock, PauseCircle } from "lucide-react";
import { STATUS_LABEL } from "@/config/admin";
import type { BusinessStatus } from "@/types/admin";

const STYLES: Record<BusinessStatus, string> = {
  active: "border-black bg-black text-white",
  trial: "border-gray-300 bg-gray-100 text-gray-900",
  suspended: "border-dashed border-gray-400 bg-white text-gray-700",
};

const ICONS = { active: CheckCircle2, trial: Clock, suspended: PauseCircle };

// Always shows text + icon so status never depends on color alone.
export default function StatusBadge({ status }: { status: BusinessStatus }) {
  const Icon = ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}