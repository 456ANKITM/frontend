"use client";

import { useEffect } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

export interface ToastState {
  type: "success" | "error";
  message: string;
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
  /** Auto-dismiss after this many milliseconds */
  duration?: number;
}

/**
 * Minimal, dependency-free toast. If the project later adds a toast library
 * (e.g. react-hot-toast), this can be swapped out without changing callers —
 * ContactForm only needs { type, message } and a close handler.
 */
export default function Toast({ toast, onClose, duration = 6000 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[90] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:right-6 sm:left-auto sm:bottom-6"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isSuccess ? "bg-black text-white" : "bg-red-50 text-red-600"
        }`}
      >
        {isSuccess ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
      </span>
      <p className="flex-1 pt-1 text-sm font-medium text-gray-800">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}