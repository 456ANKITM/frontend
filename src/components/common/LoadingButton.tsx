import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
};

export default function LoadingButton({
  loading = false,
  loadingLabel = "Loading...",
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-black px-5 text-[15px] font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-black/70 ${className}`}
    >
      {loading && (
        <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      )}
      <span>{loading ? loadingLabel : children}</span>
    </button>
  );
}