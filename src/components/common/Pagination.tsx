import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

const btn =
  "inline-flex h-9 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-black transition hover:border-black";

export default function Pagination({ page, pageSize, total, onPageChange, disabled }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium text-black">{from}–{to}</span> of{" "}
        <span className="font-medium text-black">{total}</span> businesses
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>
        <span className="px-2 text-sm text-gray-600" aria-current="page">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= pageCount}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}