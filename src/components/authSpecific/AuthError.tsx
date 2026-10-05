import { CircleAlert, Clock, WifiOff, Ban } from "lucide-react";
import type { AuthFailure } from "@/utils/mockLogin";

const MESSAGES: Record<AuthFailure["kind"], string> = {
  invalid: "The email or password you entered is incorrect.",
  disabled: "Your account is currently unavailable. Please contact your administrator.",
  businessSuspended:
    "Access to this business is currently unavailable. Please contact your administrator.",
  rateLimited: "Too many sign-in attempts. Please wait a moment and try again.",
  network: "We couldn't connect to the server. Check your connection and try again.",
};

const ICONS = {
  invalid: CircleAlert,
  disabled: Ban,
  businessSuspended: Ban,
  rateLimited: Clock,
  network: WifiOff,
} as const;

type Props = { failure: AuthFailure | null; retryIn?: number };

// Wrapper stays mounted so screen readers announce the message when it appears.
// The countdown is aria-hidden so it doesn't re-announce every second.
export default function AuthError({ failure, retryIn = 0 }: Props) {
  return (
    <div role="alert" className={failure ? "mt-6" : undefined}>
      {failure && <Banner failure={failure} retryIn={retryIn} />}
    </div>
  );
}

function Banner({ failure, retryIn }: { failure: AuthFailure; retryIn: number }) {
  const Icon = ICONS[failure.kind];
  const isWarning = failure.kind === "rateLimited";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
        isWarning
          ? "border-[#F5D18A] bg-[#FFF7E6] text-[#6B4200]"
          : "border-[#F4B8B2] bg-[#FEF3F2] text-[#912018]"
      }`}
    >
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
      <p>
        {MESSAGES[failure.kind]}
        {isWarning && retryIn > 0 && (
          <span aria-hidden="true" className="font-semibold">
            {" "}
            Try again in {retryIn}s.
          </span>
        )}
      </p>
    </div>
  );
}