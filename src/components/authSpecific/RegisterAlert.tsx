import { AlertCircle } from "lucide-react";

export type RegisterFailure =
  | { kind: "conflict" }
  | { kind: "validation" }
  | { kind: "rateLimited"; retryAfterSeconds?: number }
  | { kind: "network" };

const MESSAGES: Record<RegisterFailure["kind"], string> = {
  conflict: "An account may already exist with this email. Try signing in or resetting your password.",
  validation: "We couldn't create the account with these details. Please review the information and try again.",
  rateLimited: "Too many attempts. Please wait a moment before trying again.",
  network: "We couldn't reach the server. Check your connection and try again.",
};

export default function RegisterAlert({ failure }: { failure: RegisterFailure | null }) {
  // Live region stays mounted so screen readers announce changes.
  return (
    <div role="alert" aria-live="assertive">
      {failure && (
        <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm leading-snug text-black">
          <AlertCircle className="mt-px h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span>{MESSAGES[failure.kind]}</span>
        </p>
      )}
    </div>
  );
}