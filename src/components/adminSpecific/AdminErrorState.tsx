import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { AdminErrorKind } from "@/types/admin";

type Messages = Record<AdminErrorKind, { title: string; text: string }>;

const MESSAGES: Messages = {
  forbidden: {
    title: "Access denied",
    text: "You don't have permission to access the admin dashboard.",
  },
  session: {
    title: "Session expired",
    text: "Your session has expired. Please sign in again.",
  },
  network: {
    title: "Couldn't load data",
    text: "We couldn't load platform data. Try again.",
  },
};

type Props = {
  kind: AdminErrorKind;
  onRetry: () => void;
  /** Slim banner shown above existing data when a refresh fails */
  compact?: boolean;
  /** Override the copy (e.g. for the Owner panel). Defaults to the admin wording. */
  messages?: Messages;
};

export default function AdminErrorState({ kind, onRetry, compact, messages = MESSAGES }: Props) {
  const { title, text } = messages[kind];
  const canRetry = kind === "network";
  const needsLogin = kind === "session" || kind === "forbidden";

  const action = canRetry ? (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      Try again
    </button>
  ) : needsLogin ? (
    <Link
      href="/login"
      className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
    >
      {kind === "session" ? "Sign in" : "Go to login"}
    </Link>
  ) : null;

  if (compact) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="flex items-start gap-2.5 text-sm text-black">
          <AlertCircle className="mt-px h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          {text}
        </p>
        {action}
      </div>
    );
  }

  return (
    <div role="alert" className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-black text-black">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="font-display mt-6 text-2xl font-semibold tracking-tight text-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-600">{text}</p>
      <div className="mt-6 flex justify-center">{action}</div>
    </div>
  );
}