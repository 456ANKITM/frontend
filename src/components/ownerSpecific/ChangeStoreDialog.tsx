"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import StoreSelect from "./StoreSelect";
import { updateStaffStore } from "@/dummy/ownerStaff";
import type { StoreManager, StoreOption } from "@/types/owner";

type Props = {
  manager: StoreManager | null; // null = closed
  stores: StoreOption[];
  onClose: () => void;
  onSaved: (manager: StoreManager, storeId: string) => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function ChangeStoreDialog({ manager, stores, onClose, onSaved }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [storeId, setStoreId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (manager && !dialog.open) {
      setStoreId(manager.storeId ?? "");
      setError(null);
      dialog.showModal();
    }
    if (!manager && dialog.open) dialog.close();
  }, [manager]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!manager || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateStaffStore(manager.id, storeId || null);
      onSaved(manager, storeId);
    } catch {
      setError("Couldn't update the assignment. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  // A store that already has this person as manager needs no "will be unassigned" note.
  const options = stores.map((s) => (s.id === manager?.storeId ? { ...s, managerName: null } : s));
  const unchanged = storeId === (manager?.storeId ?? "");

  return (
    <dialog
      ref={ref}
      aria-labelledby="change-store-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      {manager && (
        <form onSubmit={submit} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="change-store-title" className="text-lg font-semibold text-black">
                {manager.storeName ? "Change store" : "Assign a store"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                Choose the store {manager.name} manages. A Store Manager can only manage one store.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 outline-none transition hover:bg-gray-100 hover:text-black focus-visible:ring-4 focus-visible:ring-black/20"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5">
            <StoreSelect
              id="change-store"
              label="Store"
              value={storeId}
              onChange={setStoreId}
              stores={options}
              emptyLabel="Unassigned"
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-dashed border-gray-400 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || unchanged}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}