import { RefreshCw } from "lucide-react";

type Props = { onClick: () => void; refreshing: boolean };

export default function RefreshButton({ onClick, refreshing }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={refreshing}
      aria-label="Refresh platform data"
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black outline-none transition-colors hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw
        className={`h-4 w-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
        aria-hidden="true"
      />
      {refreshing ? "Refreshing..." : "Refresh"}
    </button>
  );
}