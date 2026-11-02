"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Loader2, PauseCircle } from "lucide-react";
import type { Business } from "@/types/admin";

type Props = {
  business: Business | null; // null = closed
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function ConfirmStatusDialog({ business, busy, error, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (business && !dialog.open) dialog.showModal();
    if (!business && dialog.open) dialog.close();
  }, [business]);

  const activating = business?.status === "suspended";
  const Icon = activating ? CheckCircle2 : PauseCircle;

  return (
    <dialog
      ref={ref}
      aria-labelledby="status-dialog-title"
      aria-describedby="status-dialog-desc"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {business && (
        <div className="p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-black ring-1 ring-gray-200">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>

          <h2 id="status-dialog-title" className="mt-4 text-lg font-semibold text-black">
            {activating ? "Activate" : "Suspend"} {business.name}?
          </h2>
          <p id="status-dialog-desc" className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {activating
              ? `${business.ownerName} and their store managers will be able to sign in and use the platform again.`
              : `${business.ownerName} and their store managers will lose access until you activate this business again. Their data is kept.`}
          </p>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-dashed border-gray-400 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {activating ? "Activate business" : "Suspend business"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}