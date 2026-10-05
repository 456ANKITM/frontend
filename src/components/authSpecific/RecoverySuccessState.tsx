import Link from "next/link";
import { MailCheck } from "lucide-react";

type Props = { email: string; onReset: () => void };

export default function RecoverySuccessState({ email, onReset }: Props) {
  return (
    <div className="py-4 text-center" role="status">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
        <MailCheck className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="font-display mt-6 text-[28px] font-semibold leading-tight tracking-tight text-black">
        Check your email
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
        If an account exists for <span className="break-all font-medium text-black">{email}</span>,
        you&apos;ll receive password reset instructions shortly.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
        Please check your inbox and spam/junk folder.
      </p>

      <Link
        href="/login"
        className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-black px-5 text-[15px] font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
      >
        Back to login
      </Link>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded text-sm font-medium text-gray-600 outline-none hover:text-black hover:underline focus-visible:ring-4 focus-visible:ring-black/20"
      >
        Use a different email
      </button>
    </div>
  );
}