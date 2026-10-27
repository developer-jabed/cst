export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-white to-amber-50/40">
      <div className="h-64 animate-pulse bg-gradient-to-br from-gray-950 via-emerald-800 to-emerald-500" />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-16 animate-pulse rounded-3xl bg-white shadow" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-md"
            >
              <div className="h-44 animate-pulse bg-gradient-to-br from-slate-200 to-slate-100" />
              <div className="space-y-3 p-5 pt-9">
                <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-100" />
                <div className="h-5 w-4/5 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}