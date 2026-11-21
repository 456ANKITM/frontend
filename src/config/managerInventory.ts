import type { AdjustReason } from "@/types/managerInventory";

export const ADJUST_REASONS: { value: AdjustReason; label: string }[] = [
  { value: "correction", label: "Stock count correction" },
  { value: "damaged", label: "Damaged" },
  { value: "expired", label: "Expired" },
  { value: "lost", label: "Lost or stolen" },
  { value: "found", label: "Found stock" },
  { value: "other", label: "Other (add a note)" },
];

export const ADJUST_NOTE_MAX = 200;