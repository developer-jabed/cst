'use client';

import { useRouter } from 'next/navigation';

type Group = {
  id: number;
  name: string;
  department: { name: string };
  currentSemester: { name: string };
  shift: { name: string };
  session: string;
  _count?: { students: number; teachers: number };
};

type Props = {
  initialData: {
    success: boolean;
    data: Group[];
    total?: number;
  };
};

const shiftStyles: Record<
  string,
  { badge: string; border: string; accent: string }
> = {
  Morning: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    border: 'border-l-emerald-500',
    accent: 'from-emerald-500 to-teal-400',
  },
  Day: {
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    border: 'border-l-sky-500',
    accent: 'from-sky-500 to-blue-400',
  },
  Evening: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    border: 'border-l-amber-500',
    accent: 'from-amber-500 to-orange-400',
  },
};

export default function GroupOverview({ initialData }: Props) {
  const router = useRouter();
  const { data: groups = [], total } = initialData;

  const goToGroup = (id: number) => {
    router.push(`group-overview/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Group Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Manage and monitor all academic groups
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#006A4E]/10 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#006A4E"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Total Groups
              </p>
              <p className="text-lg font-black text-slate-900 leading-none">
                {total ?? groups.length}
              </p>
            </div>
          </div>
        </div>

        {/* ── Empty / Loading State ── */}
        {groups.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse flex flex-col gap-4 h-52"
              >
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="flex gap-6 pt-3 border-t border-slate-50">
                  <div className="h-8 w-12 bg-slate-100 rounded" />
                  <div className="h-8 w-12 bg-slate-100 rounded" />
                </div>
                <div className="mt-auto h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          /* ── Group Cards ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((g) => {
              const style =
                shiftStyles[g.shift?.name] ?? {
                  badge: 'bg-slate-100 text-slate-600 ring-slate-200',
                  border: 'border-l-slate-400',
                  accent: 'from-slate-400 to-slate-300',
                };

              return (
                <div
                  key={g.id}
                  className={`group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden border-l-4 ${style.border} flex flex-col`}
                >
                  {/* Top accent line */}
                  <div
                    className={`h-1 w-full bg-gradient-to-r ${style.accent} opacity-80`}
                  />

                  <div className="p-5 flex flex-col flex-1 gap-4">
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${style.badge}`}
                      >
                        {g.shift?.name} Shift
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        Session {g.session}
                      </span>
                    </div>

                    {/* Identity */}
                    <div>
                      <h3 className="font-bold text-[15px] text-slate-900 leading-snug group-hover:text-[#006A4E] transition-colors">
                        {g.currentSemester?.name} Semester · Group {g.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {g.department?.name}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                          Students
                        </p>
                        <p className="text-lg font-black text-slate-800 tabular-nums">
                          {g._count?.students ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                          Teachers
                        </p>
                        <p className="text-lg font-black text-slate-800 tabular-nums">
                          {g._count?.teachers ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => goToGroup(g.id)}
                      className="mt-auto w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-2.5 
                        bg-slate-50 text-slate-600 border border-slate-200
                        hover:bg-[#006A4E] hover:text-white hover:border-[#006A4E] 
                        transition-all duration-200 group/btn"
                    >
                      View Group
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="transition-transform group-hover/btn:translate-x-0.5"
                      >
                        <polyline points="6 3 11 8 6 13" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}