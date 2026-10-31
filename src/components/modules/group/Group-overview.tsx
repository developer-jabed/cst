'use client';

import Link from 'next/link';
import { memo } from 'react';

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

/* ───────────────────────── Constants ───────────────────────── */

type ShiftStyle = { badge: string; accent: string; glow: string };

const SHIFT_STYLES: Record<string, ShiftStyle> = {
  Morning: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    accent: 'from-emerald-500 to-teal-400',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  Day: {
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    accent: 'from-sky-500 to-blue-400',
    glow: 'group-hover:shadow-sky-500/20',
  },
  Evening: {
    badge: 'bg-amber-50 text-amber-800 ring-gold-soft',
    accent: 'from-gold to-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
};

const SHIFT_FALLBACK: ShiftStyle = {
  badge: 'bg-teal-50 text-teal-700 ring-teal-200',
  accent: 'from-primary to-emerald-500',
  glow: 'group-hover:shadow-primary/20',
};

/* ───────────────────────── Icons ───────────────────────── */

const UsersIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CapIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ───────────────────────── Card ───────────────────────── */

const GroupCard = memo(function GroupCard({ g, index }: { g: Group; index: number }) {
  const style = SHIFT_STYLES[g.shift?.name] ?? SHIFT_FALLBACK;

  return (
    <div
      className={`st-row theme-card group relative flex flex-col overflow-hidden shadow-[var(--shadow-card)] ${style.glow}`}
      style={{ ['--i' as string]: index % 9 }}
    >
      {/* Top accent */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.accent}`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${style.badge}`}>
            {g.shift?.name} Shift
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
            Session {g.session}
          </span>
        </div>

        {/* Identity */}
        <div>
          <h3 className="text-[15px] font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
            {g.currentSemester?.name} Semester · Group {g.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{g.department?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-emerald-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <UsersIcon size={15} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70">Students</p>
              <p className="text-lg font-black leading-none tabular-nums text-foreground">{g._count?.students ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-100/60 p-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-amber-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <CapIcon size={15} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70">Teachers</p>
              <p className="text-lg font-black leading-none tabular-nums text-foreground">{g._count?.teachers ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <Link
          href={`group-overview/${g.id}`}
          className="group/btn mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:border-transparent hover:bg-gradient-to-br hover:from-primary hover:to-emerald-600 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          View Group
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            className="transition-transform duration-200 group-hover/btn:translate-x-1"
          >
            <polyline points="6 3 11 8 6 13" />
          </svg>
        </Link>
      </div>
    </div>
  );
});

/* ───────────────────────── Main ───────────────────────── */

export default function GroupOverview({ initialData }: Props) {
  const { data: groups = [], total } = initialData;

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Groups
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Group Overview</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Manage and monitor all academic groups</p>
          </div>

          <div className="theme-card flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <UsersIcon />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Groups</p>
              <p className="text-xl font-black leading-none tabular-nums text-foreground">{total ?? groups.length}</p>
            </div>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="st-fade theme-card py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-primary/60 ring-1 ring-gold-soft">
              <UsersIcon size={28} />
            </div>
            <p className="text-lg font-bold text-foreground">No groups found</p>
            <p className="mt-1 text-sm text-muted-foreground">Groups will appear here once they are created.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g, i) => (
              <GroupCard key={g.id} g={g} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}