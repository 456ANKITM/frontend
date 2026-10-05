import Link from "next/link";
import { LinkIcon } from "lucide-react";

export default function ResetTokenErrorState() {
  return (
    <div className="py-4 text-center" role="alert">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-black text-black">
        <LinkIcon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="font-display mt-6 text-[28px] font-semibold leading-tight tracking-tight text-black">
        This link is invalid or has expired
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
        We couldn&apos;t reset your password. Please request a new reset link.
      </p>

      <Link
        href="/forgot-password"
        className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-black px-5 text-[15px] font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
      >
        Request a new link
      </Link>
      <Link
        href="/login"
        className="mt-4 inline-block rounded text-sm font-medium text-gray-600 outline-none hover:text-black hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
      >
        Back to login
      </Link>
    </div>
  );
}