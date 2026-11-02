const base = "animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none";

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className={`h-4 w-28 ${base}`} />
        <div className={`h-9 w-9 rounded-xl ${base}`} />
      </div>
      <div className={`mt-4 h-9 w-24 ${base}`} />
      <div className={`mt-3 h-3 w-36 ${base}`} />
    </div>
  );
}

function PanelSkeleton({ className = "", rows = 0 }: { className?: string; rows?: number }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 ${className}`}>
      <div className={`h-4 w-40 ${base}`} />
      <div className={`mt-2 h-3 w-56 ${base}`} />
      {rows > 0 ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className={`h-10 w-full ${base}`} />
          ))}
        </div>
      ) : (
        <div className={`mt-6 h-56 w-full ${base}`} />
      )}
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <p role="status" className="sr-only">
        Loading platform data...
      </p>
      <div aria-hidden="true" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <PanelSkeleton className="xl:col-span-2" />
          <PanelSkeleton rows={3} />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <PanelSkeleton className="xl:col-span-2" rows={4} />
          <PanelSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}