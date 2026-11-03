"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { assignManager } from "@/dummy/ownerStoreDetails";
import type { StoreManager } from "@/types/owner";

type Props = {
  open: boolean;
  storeId: string;
  storeName: string;
  currentManagerId: string | null;
  managers: StoreManager[];
  onClose: () => void;
  onAssigned: (manager: StoreManager) => void;
};

// Native <dialog>: focus trap, Escape and inert background come for free.
export default function AssignManagerDialog({
  open,
  storeId,
  storeName,
  currentManagerId,
  managers,
  onClose,
  onAssigned,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setSelected(currentManagerId ?? "");
      setError(null);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, currentManagerId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const manager = managers.find((m) => m.id === selected);
    if (!manager || busy) return;
    setBusy(true);
    setError(null);
    try {
      await assignManager(storeId, manager.id);
      onAssigned(manager);
    } catch {
      setError("Couldn't assign the manager. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const unchanged = selected === "" || selected === currentManagerId;

  return (
    <dialog
      ref={ref}
      aria-labelledby="assign-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-gray-300 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={submit} className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="assign-title" className="text-lg font-semibold text-black">
              {currentManagerId ? "Change manager" : "Assign manager"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Choose who runs {storeName}. A Store Manager can only manage one store.
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

        {managers.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm leading-relaxed text-gray-600">
            You haven&apos;t invited any Store Managers yet.{" "}
            <Link href="/staff" className="font-medium text-black underline underline-offset-4">
              Invite one from Staff
            </Link>
            .
          </p>
        ) : (
          <fieldset className="mt-5">
            <legend className="sr-only">Store Manager</legend>
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {managers.map((m) => {
                const current = m.id === currentManagerId;
                const elsewhere = !current && m.storeId && m.storeId !== storeId;
                return (
                  <li key={m.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-black/20 ${
                        selected === m.id ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="manager"
                        value={m.id}
                        checked={selected === m.id}
                        onChange={() => setSelected(m.id)}
                        className="mt-1 h-4 w-4 accent-black"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-black">{m.name}</span>
                        <span className="block truncate text-xs text-gray-500">{m.email}</span>
                        <span className="mt-1 block text-xs text-gray-700">
                          {current
                            ? "Current manager of this store"
                            : elsewhere
                              ? `Manages ${m.storeName}. They will be moved here.`
                              : "Not assigned to a store"}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        )}

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
            disabled={busy || unchanged || managers.length === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {currentManagerId ? "Change manager" : "Assign manager"}
          </button>
        </div>
      </form>
    </dialog>
  );
}