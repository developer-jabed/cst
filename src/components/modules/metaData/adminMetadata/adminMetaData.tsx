/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Users,
  BookOpen,
  Target,
  Award,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { IAdminDashboard, ILastSemesterResults } from "@/types/meta.interface";

interface Props {
  data: IAdminDashboard | null;
}

export default function AdminDashboardClient({ data }: Props) {
  if (!data) return <LoadingState />;

  const {
    overview,
    breakdowns,
    lastSemesterDiplomaResults,
    lastMonthAttendance,
    monthly,
    diplomaAnalysis,
    recent,
  } = data;

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header – same pattern as Group Overview */}
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Admin
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Admin Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Real-time Institute Intelligence
            </p>
          </div>

          <div className="theme-card flex items-center gap-2.5 px-4 py-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Live
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard
            icon={<Users size={18} />}
            label="Total Students"
            value={overview.totalStudents}
            accent="from-sky-500 to-blue-400"
            glow="group-hover:shadow-sky-500/20"
          />
          <KpiCard
            icon={<BookOpen size={18} />}
            label="Total Teachers"
            value={overview.totalTeachers}
            accent="from-violet-500 to-purple-400"
            glow="group-hover:shadow-violet-500/20"
          />
          <KpiCard
            icon={<Target size={18} />}
            label="Total Groups"
            value={overview.totalGroups}
            accent="from-amber-500 to-yellow-400"
            glow="group-hover:shadow-amber-500/20"
          />
          <KpiCard
            icon={<TrendingUp size={18} />}
            label="Attendance Rate"
            value={`${overview.overallAttendanceRate}%`}
            accent="from-emerald-500 to-teal-400"
            glow="group-hover:shadow-emerald-500/20"
            trend="+2.4%"
          />
          <KpiCard
            icon={<Award size={18} />}
            label="Pass Rate"
            value={`${overview.diplomaPassRate}%`}
            accent="from-rose-500 to-pink-400"
            glow="group-hover:shadow-rose-500/20"
            trend="-1.8%"
          />
          <SemesterBadgesKPI />
        </div>

        {/* Overview Section */}
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <StatusPieCard
              data={breakdowns.attendance}
              title="Live Attendance Status"
            />
          </div>
          <div className="lg:col-span-4">
            <DiplomaPerformanceCard data={lastSemesterDiplomaResults} />
          </div>
          <div className="lg:col-span-3">
            <NoticesOverviewCard
              totalNotices={overview.totalNotices}
              noticesByAudience={breakdowns.noticesByAudience}
              noticesByPriority={breakdowns.noticesByPriority}
            />
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="grid gap-5 lg:grid-cols-2">
          <MonthlyBarChart
            title="Attendance Trend (Last 6 Months)"
            data={monthly.attendance.slice(-6)}
            type="attendance"
          />
          <MonthlyBarChart
            title="Pass Rate Trend (Last 6 Months)"
            data={monthly.diplomaResults.slice(-6)}
            type="diploma"
          />
        </div>

        {/* Advanced Analytics */}
        <div className="grid gap-5 lg:grid-cols-2">
          <LastMonthAttendanceCard data={lastMonthAttendance} />
          <TeacherPerformanceCard />
        </div>

        {/* Critical Subjects & Recent */}
        <div className="grid gap-5 lg:grid-cols-2">
          <CriticalSubjectsCard
            referred={diplomaAnalysis.topReferredSubjects}
            failed={diplomaAnalysis.topFailedSubjects}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <RecentCard
              title="Recent Notices"
              items={recent.notices}
              type="notice"
            />
            <RecentCard
              title="Recent Events"
              items={recent.events}
              type="event"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Components ───────────────────────── */

function KpiCard({
  icon,
  label,
  value,
  accent,
  glow,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  glow: string;
  trend?: string;
}) {
  return (
    <div
      className={`st-row theme-card group relative flex flex-col overflow-hidden shadow-[var(--shadow-card)] ${glow}`}
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-primary shadow-sm transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
          {trend && (
            <span
              className={`text-[11px] font-bold ${
                trend.includes("+") ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-black leading-none tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SemesterBadgesKPI() {
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
  return (
    <div className="st-row theme-card group relative flex flex-col overflow-hidden shadow-[var(--shadow-card)] group-hover:shadow-indigo-500/20">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-400" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-indigo-600 shadow-sm">
            <GraduationCap size={18} />
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Semesters Active
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {semesters.map((sem) => (
            <span
              key={sem}
              className="rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200"
            >
              {sem}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiplomaPerformanceCard({
  data,
}: {
  data: ILastSemesterResults | null;
}) {
  if (!data) {
    return (
      <div className="theme-card flex h-full items-center justify-center p-8 text-muted-foreground">
        No diploma data available
      </div>
    );
  }

  return (
    <div className="st-row theme-card relative flex h-full flex-col overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-foreground">
            Last Semester Performance
          </h3>
        </div>

        <div className="text-center">
          <p className="text-5xl font-black tabular-nums text-emerald-600">
            {data.passRate}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.semesterName} Semester · {data.examYear}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatMini label="Passed" value={data.passed} color="text-emerald-600" />
          <StatMini label="Failed" value={data.failed} color="text-rose-600" />
          <StatMini label="Referred" value={data.referred} />
          <StatMini
            label="Avg GPA"
            value={data.gpa.avgGpa1?.toFixed(2) || "—"}
          />
        </div>
      </div>
    </div>
  );
}

function StatMini({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-secondary/70 to-secondary/40 p-3 ring-1 ring-border">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-black tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function LastMonthAttendanceCard({ data }: any) {
  return (
    <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="p-5">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">{data.month}</h3>
            <p className="text-sm text-muted-foreground">
              Group Attendance Analytics
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black tabular-nums text-emerald-600">
              {data.attendanceRate}%
            </p>
            <p className="text-xs font-semibold text-emerald-600">Overall</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Present", value: data.present, bg: "from-emerald-50 to-emerald-100/60", text: "text-emerald-600" },
            { label: "Absent", value: data.absent, bg: "from-rose-50 to-rose-100/60", text: "text-rose-600" },
            { label: "Late", value: data.late, bg: "from-amber-50 to-yellow-100/60", text: "text-amber-600" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl bg-gradient-to-br ${item.bg} p-3.5 text-center ring-1 ring-border`}
            >
              <p className={`text-2xl font-black tabular-nums ${item.text}`}>
                {item.value}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Group Performance
        </p>
        <div className="max-h-72 space-y-2 overflow-auto pr-1">
          {data.byGroup.slice(0, 12).map((g: any) => (
            <div
              key={g.groupId}
              className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3 ring-1 ring-border transition hover:bg-secondary/70"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-xs font-bold text-primary-foreground shadow-sm">
                  {g.semesterName ? g.semesterName.replace(/\D/g, "") : "N/A"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {g.displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {g.groupName} Group
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${g.attendanceRate}%` }}
                  />
                </div>
                <span
                  className={`min-w-[3rem] text-right text-sm font-black tabular-nums ${
                    g.attendanceRate >= 85
                      ? "text-emerald-600"
                      : g.attendanceRate >= 70
                        ? "text-amber-600"
                        : "text-rose-600"
                  }`}
                >
                  {g.attendanceRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherPerformanceCard() {
  return (
    <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-purple-400" />
      <div className="p-5">
        <div className="mb-5 flex items-center gap-2">
          <BookOpen size={16} className="text-violet-600" />
          <h3 className="text-sm font-bold text-foreground">
            Teacher Performance
          </h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50/60 p-4 ring-1 ring-violet-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600/80">
              Average Classes Taken
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums text-violet-700">
              18.4
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">
              ↑ 12% from last month
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-secondary/70 to-secondary/40 p-4 ring-1 ring-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Average Attendance Rate
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums text-foreground">
              94.2%
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-600">
              Excellent Performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPieCard({ data, title }: any) {
  const total = data.reduce((sum: number, item: any) => sum + item.count, 0) || 1;
  const colors = ["#10b981", "#eab308", "#ef4444"];

  return (
    <div className="st-row theme-card relative flex h-full flex-col overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
      <div className="flex flex-1 flex-col gap-5 p-5">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>

        <div className="flex items-center gap-8">
          <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {data.map((item: any, i: number) => {
                const pct = (item.count / total) * 100;
                const dash = pct * 2.38;
                let offset = 0;
                for (let j = 0; j < i; j++) {
                  offset -= (data[j].count / total) * 100 * 2.38;
                }
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={colors[i % colors.length]}
                    strokeWidth="18"
                    strokeDasharray={`${dash} 238`}
                    strokeDashoffset={offset}
                    className="transition-all"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex-1 space-y-3">
            {data.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="text-sm font-medium capitalize text-foreground">
                  {item.status}
                </span>
                <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoticesOverviewCard({
  totalNotices,
  noticesByAudience,
  noticesByPriority,
}: any) {
  return (
    <div className="st-row theme-card relative flex h-full flex-col overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-yellow-400" />
      <div className="flex flex-1 flex-col gap-5 p-5">
        <h3 className="text-sm font-bold text-foreground">Notices Overview</h3>

        <div>
          <p className="text-4xl font-black tabular-nums text-foreground">
            {totalNotices}
          </p>
          <p className="text-xs text-muted-foreground">Total Published Notices</p>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            By Audience
          </p>
          <div className="flex flex-wrap gap-1.5">
            {noticesByAudience.map((item: any, i: number) => (
              <span
                key={i}
                className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground ring-1 ring-border"
              >
                {item.audienceType} ({item.count})
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            By Priority
          </p>
          <div className="flex flex-wrap gap-1.5">
            {noticesByPriority.map((item: any, i: number) => (
              <span
                key={i}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                  item.priority === "HIGH"
                    ? "bg-rose-50 text-rose-700 ring-rose-200"
                    : item.priority === "MEDIUM"
                      ? "bg-amber-50 text-amber-800 ring-amber-200"
                      : "bg-sky-50 text-sky-700 ring-sky-200"
                }`}
              >
                {item.priority} ({item.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CriticalSubjectsCard({ referred, failed }: any) {
  return (
    <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-400" />
      <div className="p-5">
        <div className="mb-5 flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-500" />
          <h3 className="text-sm font-bold text-foreground">Critical Subjects</h3>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rose-600">
              Top Referred Subjects
            </p>
            <div className="space-y-1">
              {referred.slice(0, 5).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-t border-border py-2.5 text-sm first:border-t-0"
                >
                  <span className="text-foreground">{item.subject}</span>
                  <span className="font-bold tabular-nums text-rose-600">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Top Failed Subjects
            </p>
            <div className="space-y-1">
              {failed.slice(0, 5).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-t border-border py-2.5 text-sm first:border-t-0"
                >
                  <span className="text-foreground">{item.subject}</span>
                  <span className="font-bold tabular-nums text-rose-700">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyBarChart({ title, data, type }: any) {
  const isAttendance = type === "attendance";
  const max = Math.max(
    ...(isAttendance
      ? data.map((d: any) => d.attendanceRate || 0)
      : data.map((d: any) => d.passRate || 0)),
    1,
  );

  return (
    <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          isAttendance
            ? "from-sky-500 to-blue-400"
            : "from-emerald-500 to-teal-400"
        }`}
      />
      <div className="p-5">
        <h3 className="mb-5 text-sm font-bold text-foreground">{title}</h3>
        <div className="flex h-64 items-end gap-3 pt-2">
          {data.map((item: any, i: number) => {
            const value = isAttendance ? item.attendanceRate : item.passRate;
            const height = Math.max(24, (value / max) * 200);
            return (
              <div
                key={i}
                className="group flex flex-1 flex-col items-center"
              >
                <span className="mb-1.5 text-xs font-bold tabular-nums text-foreground">
                  {value}%
                </span>
                <div
                  className={`w-full max-w-[2.5rem] rounded-t-xl transition-transform duration-300 group-hover:scale-105 ${
                    isAttendance
                      ? "bg-gradient-to-t from-sky-600 to-cyan-400"
                      : "bg-gradient-to-t from-emerald-600 to-teal-400"
                  }`}
                  style={{ height: `${height}px` }}
                />
                <span className="mt-2 text-[10px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RecentCard({ title, items, type }: any) {
  return (
    <div className="st-row theme-card relative flex h-full flex-col overflow-hidden shadow-[var(--shadow-card)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">{title}</h3>
        <div className="space-y-2">
          {items.slice(0, 5).map((item: any) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl p-3 transition hover:bg-secondary/50"
            >
              {type === "notice" ? (
                <Clock size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              ) : (
                <Calendar size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(item.createdAt || item.eventDate).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="theme-content flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}