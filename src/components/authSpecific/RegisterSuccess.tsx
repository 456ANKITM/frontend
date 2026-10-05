import Link from "next/link";
import { Check } from "lucide-react";

export default function RegisterSuccess() {
  return (
    <div className="py-6 text-center" role="status">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
        <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <h1 className="font-display mt-6 text-[28px] font-semibold leading-tight tracking-tight text-black">
        Your business account has been created
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
        Your workspace is ready. You can now set up your stores and invite your managers.
      </p>
      {/* TODO(integration): point to /dashboard or an onboarding / email-verification page */}
      <Link
        href="/dashboard"
        className="mt-7 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-xl bg-black px-5 text-[15px] font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
      >
        Continue
      </Link>
    </div>
  );
}