'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { generateDiplomaReport } from '@/service/group/groupReport';
export 

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

// ── Constants ─────────────────────────────────────────────────────────────────

const GPA_KEYS = ['gpa1', 'gpa2', 'gpa3', 'gpa4', 'gpa5', 'gpa6', 'gpa7'] as const;
const SEM_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function avgGpa(r: DiplomaResult): string {
  const vals = GPA_KEYS.map((k) => r[k]).filter((v): v is number => v !== null);
  if (vals.length === 0) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

function attColor(pct: number): string {
  if (pct >= 80) return '#059669';
  if (pct >= 60) return '#d97706';
  return '#dc2626';
}

function attBadgeCls(pct: number): string {
  if (pct >= 80) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  if (pct >= 60) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-red-50 text-red-700 ring-1 ring-red-200';
}

function gpaColor(val: number | null): string {
  if (val === null) return 'text-slate-300';
  if (val >= 3.5) return 'text-emerald-600 font-bold';
  if (val >= 3) return 'text-emerald-500 font-semibold';
  if (val >= 2) return 'text-amber-600 font-semibold';
  return 'text-red-500 font-semibold';
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ src, name, size = 8 }: { src?: string; name: string; size?: number }) {
  const px = size * 4;
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#006A4E]/20 to-[#006A4E]/40 flex items-center justify-center ${size <= 8 ? 'text-xs' : 'text-sm'} font-bold text-[#006A4E] flex-shrink-0 ring-2 ring-white shadow-sm`}
    >
      {getInitials(name)}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string; label: string }> = {
    PASSED:   { cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', label: 'Passed'   },
    FAILED:   { cls: 'bg-red-50 text-red-600 ring-red-200',             dot: 'bg-red-500',     label: 'Failed'   },
    REFERRED: { cls: 'bg-amber-50 text-amber-700 ring-amber-200',       dot: 'bg-amber-400',   label: 'Referred' },
  };
  const s = map[status] ?? {
    cls: 'bg-slate-100 text-slate-500 ring-slate-200',
    dot: 'bg-slate-400',
    label: status,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ring-1 ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent = false,
  icon,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-2xl p-5 overflow-hidden flex flex-col gap-3 ${
        accent
          ? 'bg-[#006A4E] text-white shadow-lg shadow-emerald-900/20'
          : 'bg-white border border-slate-100 text-slate-800 shadow-sm'
      }`}
    >
      {accent && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        </>
      )}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          accent ? 'bg-white/15' : 'bg-[#006A4E]/8'
        }`}
      >
        <span className={accent ? 'text-emerald-100' : 'text-[#006A4E]'}>{icon}</span>
      </div>
      <div>
        <p
          className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${
            accent ? 'text-emerald-200' : 'text-slate-400'
          }`}
        >
          {label}
        </p>
        <p
          className={`text-3xl font-black tabular-nums leading-none ${
            accent ? 'text-white' : 'text-slate-900'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Report Button ─────────────────────────────────────────────────────────────
// Calls the generateDiplomaReport server action directly — no API route needed.

function ReportButton({
  groupId,
  groupName,
  groupSession,
  activeSem,
}: {
  groupId: number;
  groupName: string;
  groupSession: string;
  activeSem: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    try {
      // Server action fetches fresh group data + generates PDF internally
      const result = await generateDiplomaReport(
        groupId,
        activeSem !== 'all' ? activeSem : undefined,
      );

      if ('error' in result) throw new Error(result.error);

      // Decode base64 → Blob → trigger browser download
      const bytes  = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
      const blob   = new Blob([bytes], { type: 'application/pdf' });
      const url    = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href     = url;
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
        className={[
          'group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl',
          'text-sm font-semibold tracking-wide transition-all duration-200 select-none overflow-hidden',
          loading
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : 'bg-[#006A4E] text-white shadow-lg shadow-emerald-900/20 hover:bg-[#005a42] hover:shadow-xl hover:shadow-emerald-900/25 hover:-translate-y-0.5 active:translate-y-0 border border-[#006A4E]',
        ].join(' ')}
      >
        {!loading && (
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        )}
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Generating PDF…
          </>
        ) : (
          <>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Download Report
            {activeSem !== 'all' && (
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
                {activeSem.toUpperCase()}
              </span>
            )}
          </>
        )}
      </button>
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 3.75a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GroupDetailClient({ group }: { group: Group }) {
  const router = useRouter();
  const [activeSem, setActiveSem] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'students' | 'results'>('students');

  const students = group.students ?? [];
  const results  = group.diplomaResults ?? [];

  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
  const semesters  = [...new Set(results.map((r) => r.semesterName))].sort();

  const filteredResults =
    activeSem === 'all' ? results : results.filter((r) => r.semesterName === activeSem);

  const totalStudents = students.length;
  const passCount     = results.filter((r) => r.status === 'PASSED').length;
  const failCount     = results.filter((r) => r.status === 'FAILED').length;
  const referCount    = results.filter((r) => r.status === 'REFERRED').length;
  const passRate      = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;
  const avgAtt        =
    totalStudents > 0
      ? Math.round(students.reduce((s, st) => s + (st.attendance ?? 0), 0) / totalStudents)
      : 0;

  const shiftColor: Record<string, string> = {
    Morning: 'bg-sky-50 text-sky-700 ring-sky-200',
    Day:     'bg-violet-50 text-violet-700 ring-violet-200',
    Evening: 'bg-orange-50 text-orange-700 ring-orange-200',
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">

        {/* ── Back button ── */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
        >
          <span className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center group-hover:border-slate-300 transition-colors shadow-sm">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="10 3 5 8 10 13" />
            </svg>
          </span>
          Back to groups
        </button>

        {/* ── Hero card ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#006A4E] via-emerald-400 to-[#006A4E]" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">

              {/* Group icon */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#006A4E] to-[#00a87a] flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-emerald-900/20">
                  {group.name.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
              </div>

              {/* Group info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      Group {group.name}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {group.department?.name}&nbsp;·&nbsp;Session {group.session}
                    </p>
                  </div>
                  {group.crStudent && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                      <span className="font-semibold">CR:</span> {group.crStudent.name}
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ring-1 ${
                      shiftColor[group.shift?.name] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
                    }`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 6v6l3.5 3.5" />
                    </svg>
                    {group.shift?.name} Shift
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                    Semester {group.currentSemester?.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                    {group.department?.shortName}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <StatCard
                label="Students"
                value={totalStudents || '—'}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
              />
              <StatCard
                label="Avg Attendance"
                value={avgAtt ? `${avgAtt}%` : '—'}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
              <StatCard
                label="Total Results"
                value={results.length || '—'}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                }
              />
              <StatCard
                label="Pass Rate"
                value={results.length ? `${passRate}%` : '—'}
                accent
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* ── Tab nav ── */}
        <div className="flex items-center gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 w-fit">
          {(['students', 'results'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-[#006A4E] text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
              <span
                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab === 'students' ? totalStudents : results.length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Students tab ── */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <h2 className="font-bold text-slate-900">Enrolled Students</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalStudents} student{totalStudents !== 1 ? 's' : ''} in this group
              </p>
            </div>

            {students.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 text-slate-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-sm font-medium">No students enrolled yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {students.map((s, idx) => {
                  const pct = s.attendance ?? 0;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                    >
                      <span className="text-xs font-mono text-slate-300 w-5 text-right flex-shrink-0">
                        {idx + 1}
                      </span>
                      <Avatar src={s.profilePhoto} name={s.name} size={9} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Roll:{' '}
                          <span className="font-mono font-semibold text-slate-500">{s.roll}</span>
                          &nbsp;·&nbsp;{s.gender}
                        </p>
                      </div>
                      {pct === 0 ? (
                        <span className="text-xs text-slate-300 italic">No data</span>
                      ) : (
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="hidden sm:block w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{ width: `${pct}%`, background: attColor(pct) }}
                            />
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${attBadgeCls(pct)}`}>
                            {pct}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Results tab ── */}
        {activeTab === 'results' && (
          <div className="space-y-4">

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Passed',   val: passCount,  cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
                  { label: 'Failed',   val: failCount,  cls: 'bg-red-50 text-red-600 ring-red-200'             },
                  { label: 'Referred', val: referCount, cls: 'bg-amber-50 text-amber-700 ring-amber-200'       },
                ].map((s) => (
                  <span key={s.label} className={`text-xs font-bold px-3 py-1.5 rounded-full ring-1 ${s.cls}`}>
                    {s.label}: {s.val}
                  </span>
                ))}
              </div>

              {/* Report button — uses server action, no API route needed */}
              {results.length > 0 && (
                <ReportButton
                  groupId={group.id}
                  groupName={group.name}
                  groupSession={group.session}
                  activeSem={activeSem}
                />
              )}
            </div>

            {/* Semester filters */}
            {semesters.length > 1 && (
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveSem('all')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    activeSem === 'all'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  All semesters
                </button>
                {semesters.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setActiveSem(sem)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                      activeSem === sem
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {sem} sem
                  </button>
                ))}
              </div>
            )}

            {/* Results table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table style={{ tableLayout: 'fixed', minWidth: '900px', width: '100%' }}>
                  <thead>
                    <tr className="bg-slate-800 text-white text-xs">
                      <th className="text-left px-4 py-3.5 font-semibold tracking-wide w-[185px]">Student</th>
                      <th className="text-left px-3 py-3.5 font-semibold tracking-wide w-[82px]">Roll</th>
                      <th className="text-left px-3 py-3.5 font-semibold tracking-wide w-[68px]">Sem.</th>
                      <th className="text-left px-3 py-3.5 font-semibold tracking-wide w-[52px]">Year</th>
                      {SEM_LABELS.map((l) => (
                        <th key={l} className="text-center px-2 py-3.5 font-semibold w-[44px] text-slate-400">
                          {l}
                        </th>
                      ))}
                      <th className="text-center px-3 py-3.5 font-semibold tracking-wide w-[56px]">Avg</th>
                      <th className="text-center px-3 py-3.5 font-semibold tracking-wide w-[90px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-300">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.35-4.35" />
                            </svg>
                            <p className="text-sm font-medium">No results found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((r, idx) => {
                        const student = studentMap[r.studentId];
                        const avg     = avgGpa(r);
                        return (
                          <tr
                            key={r.id}
                            className={`border-t border-slate-50 hover:bg-slate-50/60 transition-colors ${
                              idx % 2 === 1 ? 'bg-slate-50/30' : ''
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar
                                  src={student?.profilePhoto}
                                  name={student?.name ?? '?'}
                                  size={7}
                                />
                                <span className="text-xs font-semibold text-slate-800 truncate">
                                  {student?.name ?? '—'}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 font-mono text-[11px] text-slate-400">{r.roll}</td>
                            <td className="px-3 py-3 text-xs text-slate-500">{r.semesterName}</td>
                            <td className="px-3 py-3 text-xs text-slate-500">{r.examYear}</td>
                            {GPA_KEYS.map((k) => (
                              <td key={k} className="px-2 py-3 text-center">
                                {r[k] !== null ? (
                                  <span className={`text-[11px] ${gpaColor(r[k])}`}>
                                    {Number(r[k]).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-slate-200 text-[11px]">—</span>
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`text-[11px] font-bold ${
                                  avg === '—'
                                    ? 'text-slate-300'
                                    : Number(avg) >= 3
                                    ? 'text-emerald-600'
                                    : Number(avg) >= 2
                                    ? 'text-amber-600'
                                    : 'text-red-500'
                                }`}
                              >
                                {avg}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <StatusPill status={r.status} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              {filteredResults.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    Showing{' '}
                    <span className="font-semibold text-slate-600">{filteredResults.length}</span>{' '}
                    result{filteredResults.length !== 1 ? 's' : ''}
                    {activeSem !== 'all' && (
                      <>
                        {' '}·{' '}
                        <span className="font-semibold text-slate-600">{activeSem} semester</span>
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      GPA ≥ 3.0
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      GPA 2–3
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      GPA &lt; 2
                    </span>
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