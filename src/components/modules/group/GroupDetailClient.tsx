'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, Fragment, memo, type ReactNode } from 'react';
import Image from 'next/image';
import { generateGroupResultPdf } from '@/service/group/groupResultPdf.service';

// ── Types ────────────────────────────────────────────────────────────────────

type Student = {
  id: number;
  userId: number;
  groupId: number;
  departmentId: number;
  name: string;
  email: string;
  roll: string;
  registration: string;
  mobile: string;
  gender: string;
  birthDate: string;
  birthnumber: string;
  nid: string;
  fatherName: string;
  motherName: string;
  fatherMobile: string;
  motherMobile: string;
  presentAddress: string;
  permanentAddress: string;
  profilePhoto: string;
  isDeleted: boolean;
  attendance?: number;
  department: { id: number; name: string; shortName: string };
};

type SubjectBreakdownItem = {
  code: string;
  name: string;
  shortName?: string | null;
  semesterName: string | null;
  type: 'REFERRED' | 'FAILED';
};

type DiplomaResult = {
  id: number;
  roll: string;
  studentId: number;
  groupId: number;
  examYear: number;
  semesterName: string;
  regulation: string;
  instituteCode: string;
  instituteName: string;
  status: 'PASSED' | 'FAILED' | 'REFERRED';
  gpa1: number | null;
  gpa2: number | null;
  gpa3: number | null;
  gpa4: number | null;
  gpa5: number | null;
  gpa6: number | null;
  gpa7: number | null;
  failedSubjects: string[];
  referredSubjects: string[];
  subjectBreakdown?: SubjectBreakdownItem[];
};

type Group = {
  id: number;
  name: string;
  session: string;
  department: { id: number; name: string; shortName: string };
  currentSemester: { id: number; name: string; order: number };
  shift: { id: number; name: string; shortName: string };
  crStudent: null | { name: string };
  diplomaResults: DiplomaResult[];
  students?: Student[];
};

// ── Constants ────────────────────────────────────────────────────────────────

const GPA_KEYS = ['gpa1', 'gpa2', 'gpa3', 'gpa4', 'gpa5', 'gpa6', 'gpa7'] as const;
const SEM_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'] as const;
const RESULT_TABLE_COLS = 4 + SEM_LABELS.length + 2;

const SHIFT_COLOR: Record<string, string> = {
  Morning: 'bg-sky-50 text-sky-700 ring-sky-200',
  Day: 'bg-violet-50 text-violet-700 ring-violet-200',
  Evening: 'bg-orange-50 text-orange-700 ring-orange-200',
};
const SHIFT_FALLBACK = 'bg-teal-50 text-teal-700 ring-teal-200';

const AVATAR_SIZES: Record<number, { box: string; text: string }> = {
  7: { box: 'h-7 w-7', text: 'text-[10px]' },
  9: { box: 'h-9 w-9', text: 'text-xs' },
};

const STATUS_STYLES: Record<string, { cls: string; dot: string; label: string }> = {
  PASSED: { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', label: 'Passed' },
  FAILED: { cls: 'bg-rose-50 text-rose-600 ring-rose-200', dot: 'bg-rose-500', label: 'Failed' },
  REFERRED: { cls: 'bg-amber-50 text-amber-800 ring-gold-soft', dot: 'bg-amber-400', label: 'Referred' },
};

const STAT_ACCENTS = {
  sky: { bar: 'from-sky-400 to-sky-600', icon: 'from-sky-50 to-sky-100 text-sky-600' },
  gold: { bar: 'from-gold-soft to-gold', icon: 'from-amber-50 to-yellow-100 text-amber-600' },
  violet: { bar: 'from-violet-400 to-violet-600', icon: 'from-violet-50 to-violet-100 text-violet-600' },
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function avgGpa(r: DiplomaResult): string {
  const vals = GPA_KEYS.map((k) => r[k]).filter((v): v is number => v !== null);
  if (vals.length === 0) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

const attColor = (pct: number) => (pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500');

const attBadgeCls = (pct: number) =>
  pct >= 80
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    : pct >= 60
      ? 'bg-amber-50 text-amber-800 ring-1 ring-gold-soft'
      : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';

function gpaColor(val: number | null): string {
  if (val === null) return 'text-muted-foreground/40';
  if (val >= 3.5) return 'text-emerald-600 font-bold';
  if (val >= 3) return 'text-emerald-500 font-semibold';
  if (val >= 2) return 'text-amber-600 font-semibold';
  return 'text-rose-500 font-semibold';
}

const avgColor = (avg: string) =>
  avg === '—' ? 'text-muted-foreground/40' : Number(avg) >= 3 ? 'text-emerald-600' : Number(avg) >= 2 ? 'text-amber-600' : 'text-rose-500';

const getInitials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

function splitBreakdown(r: DiplomaResult) {
  const list = r.subjectBreakdown ?? [];
  const referred = list.filter((s) => s.type === 'REFERRED');
  const failed = list.filter((s) => s.type === 'FAILED');
  return {
    referred,
    failed,
    referredCount: list.length ? referred.length : r.referredSubjects.length,
    failedCount: list.length ? failed.length : r.failedSubjects.length,
  };
}

// ── Icons ────────────────────────────────────────────────────────────────────

const ICONS = {
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </>
  ),
  pulse: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  download: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </>
  ),
  back: <polyline points="10 3 5 8 10 13" />,
} satisfies Record<string, ReactNode>;

const Icon = ({ name, size = 16, vb = 24 }: { name: keyof typeof ICONS; size?: number; vb?: number }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name]}
  </svg>
);

// ── Sub Components ───────────────────────────────────────────────────────────

const Avatar = memo(function Avatar({ src, name, size = 7 }: { src?: string; name: string; size?: 7 | 9 }) {
  // NOTE: sizes are looked up from a fixed map. The old `w-${size}` template strings
  // were never generated by Tailwind (it can't see dynamic class names) so avatars
  // had no width/height.
  const s = AVATAR_SIZES[size];
  const ring = 'shrink-0 rounded-full ring-2 ring-gold-soft/70 shadow-sm';
  if (src) {
    return <Image src={src} alt={name} width={size * 4} height={size * 4} className={`${s.box} ${ring} object-cover`} />;
  }
  return (
    <div className={`${s.box} ${s.text} ${ring} flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white`}>
      {getInitials(name)}
    </div>
  );
});

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { cls: 'bg-muted text-muted-foreground ring-border', dot: 'bg-muted-foreground', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${s.cls}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function SubjectChip({ subject }: { subject: SubjectBreakdownItem }) {
  const cls = subject.type === 'FAILED' ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-amber-50 text-amber-800 ring-gold-soft';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10.5px] font-semibold ring-1 ring-inset ${cls}`}>
      <span className="font-mono font-bold">{subject.code}</span>
      <span className="max-w-[110px] truncate">{subject.name}</span>
      {subject.semesterName && <span className="font-normal opacity-60">· {subject.semesterName}</span>}
    </span>
  );
}

function SubjectBreakdownRow({ r, colSpan }: { r: DiplomaResult; colSpan: number }) {
  const { referred, failed } = splitBreakdown(r);
  if (!referred.length && !failed.length) return null;
  return (
    <tr className="border-t border-border bg-secondary/40">
      <td colSpan={colSpan} className="px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {failed.map((s) => <SubjectChip key={`f-${s.code}`} subject={s} />)}
          {referred.map((s) => <SubjectChip key={`r-${s.code}`} subject={s} />)}
        </div>
      </td>
    </tr>
  );
}

function StatCard({
  label, value, icon, accent, featured = false, index,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof ICONS;
  accent?: keyof typeof STAT_ACCENTS;
  featured?: boolean;
  index: number;
}) {
  const a = accent ? STAT_ACCENTS[accent] : null;
  return (
    <div
      className={`st-fade group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? 'bg-gradient-to-br from-[#0B1F1A] via-primary to-emerald-600 text-white shadow-lg shadow-primary/30'
          : 'border border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)]'
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {featured ? (
        <>
          <span className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute -bottom-8 left-1/3 h-20 w-20 rounded-full bg-gold/20" />
        </>
      ) : (
        a && <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${a.bar}`} />
      )}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
          featured ? 'bg-white/15 text-emerald-100' : `bg-gradient-to-br ${a?.icon}`
        }`}
      >
        <Icon name={icon} />
      </div>
      <div className="relative">
        <p className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${featured ? 'text-emerald-200' : 'text-muted-foreground'}`}>{label}</p>
        <p className={`text-3xl font-black leading-none tabular-nums ${featured ? 'text-white' : 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}

function ReportButton({ groupId }: { groupId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const result = await generateGroupResultPdf(groupId);
      if (!result.success) throw new Error(result.message ?? 'Failed to generate report');

      const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`group relative inline-flex select-none items-center gap-2.5 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 ${
          loading
            ? 'cursor-not-allowed border border-border bg-muted text-muted-foreground'
            : 'bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-gold/40 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95'
        }`}
      >
        {!loading && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
        )}
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            Generating PDF…
          </>
        ) : (
          <>
            <Icon name="download" size={15} />
            Download Current Semester Report
          </>
        )}
      </button>
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function GroupDetailClient({ group }: { group: Group }) {
  const router = useRouter();
  const [activeSem, setActiveSem] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'students' | 'results'>('students');

  const students = useMemo(() => group.students ?? [], [group.students]);
  const results = useMemo(() => group.diplomaResults ?? [], [group.diplomaResults]);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const semesters = useMemo(() => [...new Set(results.map((r) => r.semesterName))].sort(), [results]);

  const filteredResults = useMemo(
    () => (activeSem === 'all' ? results : results.filter((r) => r.semesterName === activeSem)),
    [results, activeSem]
  );

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const passCount = results.filter((r) => r.status === 'PASSED').length;
    const failCount = results.filter((r) => r.status === 'FAILED').length;
    const referCount = results.filter((r) => r.status === 'REFERRED').length;
    return {
      totalStudents,
      passCount,
      failCount,
      referCount,
      passRate: results.length > 0 ? Math.round((passCount / results.length) * 100) : 0,
      avgAtt: totalStudents > 0 ? Math.round(students.reduce((s, st) => s + (st.attendance ?? 0), 0) / totalStudents) : 0,
    };
  }, [students, results]);

  const { totalStudents, passCount, failCount, referCount, passRate, avgAtt } = stats;

  const filterBtn = (active: boolean) =>
    `rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
      active
        ? 'border-transparent bg-gradient-to-br from-[#0B1F1A] to-primary text-white shadow-md shadow-primary/25'
        : 'border-border bg-card text-muted-foreground hover:border-gold-soft hover:text-primary'
    }`;

  return (
    <div className="theme-content min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* ── Back ── */}
        <button
          onClick={() => router.back()}
          className="group st-fade inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card shadow-sm transition-all duration-200 group-hover:-translate-x-0.5 group-hover:border-gold-soft">
            <Icon name="back" size={12} vb={16} />
          </span>
          Back to groups
        </button>

        {/* ── Hero Card ── */}
        <div className="st-fade overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]" style={{ animationDelay: '50ms' }}>
          <div className="h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-gold" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Icon */}
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-2xl font-black text-white shadow-lg shadow-primary/30 ring-2 ring-gold-soft">
                  {group.name.charAt(0)}
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-card bg-emerald-400" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Group {group.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {group.department?.name} · Session {group.session}
                    </p>
                  </div>

                  {group.crStudent && (
                    <div className="flex items-center gap-2 rounded-xl border border-gold-soft bg-gradient-to-r from-amber-50 to-card px-3 py-1.5 text-xs text-amber-800">
                      <span className="font-bold">CR:</span>
                      {group.crStudent.name}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${SHIFT_COLOR[group.shift?.name] ?? SHIFT_FALLBACK}`}>
                    {group.shift?.name} Shift
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                    Semester {group.currentSemester?.name}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-border">
                    {group.department?.shortName}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard index={0} label="Students" value={totalStudents || '—'} icon="users" accent="sky" />
              <StatCard index={1} label="Avg Attendance" value={avgAtt ? `${avgAtt}%` : '—'} icon="calendar" accent="gold" />
              <StatCard index={2} label="Total Results" value={results.length || '—'} icon="file" accent="violet" />
              <StatCard index={3} label="Pass Rate" value={results.length ? `${passRate}%` : '—'} icon="pulse" featured />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="st-fade flex w-fit items-center gap-1.5 rounded-2xl border border-border bg-gradient-to-r from-secondary via-card to-secondary p-1.5 shadow-sm" style={{ animationDelay: '100ms' }}>
          {(['students', 'results'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold capitalize transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30'
                  : 'text-muted-foreground hover:bg-card hover:text-primary'
              }`}
            >
              {tab}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-card text-primary'}`}>
                {tab === 'students' ? totalStudents : results.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Students Tab ── */}
        {activeTab === 'students' && (
          <div className="st-fade overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="h-1 bg-gradient-to-r from-sky-400 via-primary to-emerald-500" />
            <div className="border-b border-border bg-gradient-to-r from-secondary via-accent/50 to-secondary px-6 py-4">
              <h2 className="text-base font-bold text-foreground">Enrolled Students</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {totalStudents} student{totalStudents !== 1 ? 's' : ''} currently in this group
              </p>
            </div>

            {students.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground/60">
                <Icon name="users" size={28} />
                <p className="text-sm font-medium">No students enrolled yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {students.map((s, idx) => {
                  const pct = s.attendance ?? 0;
                  return (
                    <div
                      key={s.id}
                      className="st-row group flex items-center gap-4 px-6 py-3.5 transition-colors duration-300 hover:bg-gradient-to-r hover:from-secondary hover:via-accent/40 hover:to-transparent"
                      style={{ ['--i' as string]: Math.min(idx, 12) }}
                    >
                      <span className="w-5 text-right font-mono text-xs text-muted-foreground/60">{idx + 1}</span>
                      <div className="transition-transform duration-300 group-hover:scale-110">
                        <Avatar src={s.profilePhoto} name={s.name} size={9} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">{s.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Roll: <span className="font-mono font-semibold text-primary/80">{s.roll}</span>
                          &nbsp;·&nbsp;{s.gender}
                        </p>
                      </div>
                      {pct === 0 ? (
                        <span className="text-xs italic text-muted-foreground/60">No data</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                            <div className={`h-1.5 rounded-full transition-all duration-700 ${attColor(pct)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${attBadgeCls(pct)}`}>{pct}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Results Tab ── */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {/* Controls */}
            <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Passed', val: passCount, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
                  { label: 'Failed', val: failCount, cls: 'bg-rose-50 text-rose-600 ring-rose-200' },
                  { label: 'Referred', val: referCount, cls: 'bg-amber-50 text-amber-800 ring-gold-soft' },
                ].map((s) => (
                  <span key={s.label} className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${s.cls}`}>
                    {s.label}: {s.val}
                  </span>
                ))}
              </div>
              {results.length > 0 && <ReportButton groupId={group.id} />}
            </div>

            {/* Semester Filters */}
            {semesters.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setActiveSem('all')} className={filterBtn(activeSem === 'all')}>
                  All semesters
                </button>
                {semesters.map((sem) => (
                  <button key={sem} onClick={() => setActiveSem(sem)} className={filterBtn(activeSem === sem)}>
                    {sem} sem
                  </button>
                ))}
              </div>
            )}

            {/* Results Table */}
            <div className="st-fade overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="h-1 bg-gradient-to-r from-violet-400 via-primary to-gold" />
              <div className="overflow-x-auto">
                <table style={{ tableLayout: 'fixed', minWidth: '900px', width: '100%' }}>
                  <thead>
                    <tr className="bg-gradient-to-r from-[#0B1F1A] via-[#0B3B2E] to-primary text-xs text-white">
                      <th className="w-[185px] px-4 py-3.5 text-left font-semibold">Student</th>
                      <th className="w-[82px] px-3 py-3.5 text-left font-semibold">Roll</th>
                      <th className="w-[68px] px-3 py-3.5 text-left font-semibold">Sem.</th>
                      <th className="w-[52px] px-3 py-3.5 text-left font-semibold">Year</th>
                      {SEM_LABELS.map((l) => (
                        <th key={l} className="w-[44px] px-2 py-3.5 text-center font-semibold text-gold-soft">{l}</th>
                      ))}
                      <th className="w-[56px] px-3 py-3.5 text-center font-semibold">Avg</th>
                      <th className="w-[90px] px-3 py-3.5 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={RESULT_TABLE_COLS} className="py-16 text-center text-muted-foreground/60">
                          <p className="text-sm font-medium">No results found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((r, idx) => {
                        const student = studentMap.get(r.studentId);
                        const avg = avgGpa(r);
                        const { referredCount, failedCount } = splitBreakdown(r);

                        return (
                          <Fragment key={r.id}>
                            <tr
                              className={`st-row group border-t border-border/70 transition-colors duration-300 hover:bg-gradient-to-r hover:from-secondary hover:via-accent/40 hover:to-transparent ${idx % 2 === 1 ? 'bg-secondary/30' : ''}`}
                              style={{ ['--i' as string]: Math.min(idx, 12) }}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <Avatar src={student?.profilePhoto} name={student?.name ?? '?'} size={7} />
                                  <span className="truncate text-xs font-semibold text-foreground">{student?.name ?? '—'}</span>
                                </div>
                              </td>
                              <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">{r.roll}</td>
                              <td className="px-3 py-3 text-xs text-foreground/70">{r.semesterName}</td>
                              <td className="px-3 py-3 text-xs text-foreground/70">{r.examYear}</td>
                              {GPA_KEYS.map((k) => (
                                <td key={k} className="px-2 py-3 text-center">
                                  {r[k] !== null ? (
                                    <span className={`text-[11px] ${gpaColor(r[k])}`}>{Number(r[k]).toFixed(2)}</span>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground/30">—</span>
                                  )}
                                </td>
                              ))}
                              <td className="px-3 py-3 text-center">
                                <span className={`text-[11px] font-bold ${avgColor(avg)}`}>{avg}</span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <StatusPill status={r.status} />
                                  {(failedCount > 0 || referredCount > 0) && (
                                    <span className="text-[9.5px] font-semibold text-muted-foreground">
                                      {failedCount > 0 && <span className="text-rose-500">✕{failedCount}</span>}
                                      {failedCount > 0 && referredCount > 0 && ' · '}
                                      {referredCount > 0 && <span className="text-amber-500">⚠{referredCount}</span>}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                            <SubjectBreakdownRow r={r} colSpan={RESULT_TABLE_COLS} />
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredResults.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-gradient-to-r from-secondary/60 via-transparent to-secondary/60 px-6 py-3">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-bold text-primary">{filteredResults.length}</span> result
                    {filteredResults.length !== 1 ? 's' : ''}
                    {activeSem !== 'all' && (
                      <>
                        {' '}· <span className="font-bold text-primary">{activeSem} semester</span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />GPA ≥ 3.0</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />GPA 2–3</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />GPA &lt; 2</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}