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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-0.5">
              Real-time Institute Intelligence
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-2xl text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10 space-y-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <KpiCard
            icon={<Users />}
            label="Total Students"
            value={overview.totalStudents}
            color="blue"
          />
          <KpiCard
            icon={<BookOpen />}
            label="Total Teachers"
            value={overview.totalTeachers}
            color="violet"
          />
          <KpiCard
            icon={<Target />}
            label="Total Groups"
            value={overview.totalGroups}
            color="amber"
          />
          <KpiCard
            icon={<TrendingUp />}
            label="Attendance Rate"
            value={`${overview.overallAttendanceRate}%`}
            color="emerald"
            trend="+2.4%"
          />
          <KpiCard
            icon={<Award />}
            label="Pass Rate"
            value={`${overview.diplomaPassRate}%`}
            color="rose"
            trend="-1.8%"
          />
          <SemesterBadgesKPI />
        </div>

        {/* Overview Section */}
        <div className="grid lg:grid-cols-12 gap-6">
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
        <div className="grid lg:grid-cols-2 gap-6">
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
        <div className="grid lg:grid-cols-2 gap-6">
          <LastMonthAttendanceCard data={lastMonthAttendance} />
          <TeacherPerformanceCard />
        </div>

        {/* Critical Subjects & Recent */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CriticalSubjectsCard
            referred={diplomaAnalysis.topReferredSubjects}
            failed={diplomaAnalysis.topFailedSubjects}
          />
          <div className="grid md:grid-cols-2 gap-6">
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

/* ====================== ALL COMPONENTS (No Missing) ====================== */

function KpiCard({ icon, label, value, color, trend }: any) {
  const borderColors: any = {
    blue: "border-l-blue-600",
    violet: "border-l-violet-600",
    amber: "border-l-amber-600",
    emerald: "border-l-emerald-600",
    rose: "border-l-rose-600",
    slate: "border-l-slate-700",
  };

  return (
    <div
      className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl transition-all ${borderColors[color]} border-l-4 group`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tighter mt-1">
            {value}
          </p>
        </div>
        {trend && (
          <span
            className={`text-xs font-medium mt-2 ${trend.includes("+") ? "text-emerald-600" : "text-rose-600"}`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function SemesterBadgesKPI() {
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl transition-all border-l-4 border-l-indigo-600">
      <div className="flex items-center gap-3 mb-4">
        <GraduationCap className="w-6 h-6 text-indigo-600" />
        <p className="text-slate-500 text-sm font-medium">Semesters Active</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {semesters.map((sem, i) => (
          <div
            key={i}
            className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-2 rounded-xl"
          >
            {sem}
          </div>
        ))}
      </div>
    </div>
  );
}

function DiplomaPerformanceCard({
  data,
}: {
  data: ILastSemesterResults | null;
}) {
  if (!data)
    return (
      <div className="bg-white rounded-3xl p-8 h-full flex items-center justify-center text-slate-400">
        No diploma data available
      </div>
    );

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-emerald-600" /> Last Semester Performance
      </h3>
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-emerald-600">
          {data.passRate}%
        </div>
        <p className="text-slate-500 mt-1">
          {data.semesterName} Semester • {data.examYear}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          Passed:{" "}
          <span className="font-bold text-emerald-600">{data.passed}</span>
        </div>
        <div>
          Failed: <span className="font-bold text-rose-600">{data.failed}</span>
        </div>
        <div>
          Referred: <span className="font-bold">{data.referred}</span>
        </div>
        <div>
          Avg GPA:{" "}
          <span className="font-bold">
            {data.gpa.avgGpa1?.toFixed(2) || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function LastMonthAttendanceCard({ data }: any) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-2xl font-semibold">{data.month}</h3>
          <p className="text-slate-500">Group Attendance Analytics</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-emerald-600">
            {data.attendanceRate}%
          </div>
          <p className="text-sm text-emerald-600">Overall</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Present", value: data.present, color: "emerald" },
          { label: "Absent", value: data.absent, color: "rose" },
          { label: "Late", value: data.late, color: "amber" },
        ].map((item, i) => (
          <div
            key={i}
            className={`bg-${item.color}-50 rounded-2xl p-5 text-center border border-${item.color}-100`}
          >
            <p className={`text-3xl font-bold text-${item.color}-600`}>
              {item.value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-4">
        GROUP PERFORMANCE
      </p>
      <div className="space-y-3 max-h-80 overflow-auto pr-2">
        {data.byGroup.slice(0, 12).map((g: any) => (
          <div
            key={g.groupId}
            className="flex items-center justify-between bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 px-6 py-4 rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm">
                {g.semesterName ? g.semesterName.replace(/\D/g, "") : "N/A"}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{g.displayName}</p>
                <p className="text-xs text-slate-500">{g.groupName} Group</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${g.attendanceRate}%` }}
                />
              </div>
              <span
                className={`font-bold text-xl ${g.attendanceRate >= 85 ? "text-emerald-600" : g.attendanceRate >= 70 ? "text-amber-600" : "text-red-600"}`}
              >
                {g.attendanceRate}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeacherPerformanceCard() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
        <BookOpen className="text-violet-600" /> Teacher Performance
      </h3>
      <div className="space-y-6">
        <div className="p-5 bg-violet-50 rounded-2xl">
          <p className="text-sm text-violet-600 font-medium">
            Average Classes Taken
          </p>
          <p className="text-4xl font-bold text-violet-700 mt-2">18.4</p>
          <p className="text-xs text-emerald-600 mt-1">↑ 12% from last month</p>
        </div>
        <div className="p-5 bg-slate-50 rounded-2xl">
          <p className="text-sm text-slate-600 font-medium">
            Average Attendance Rate
          </p>
          <p className="text-4xl font-bold text-slate-700 mt-2">94.2%</p>
          <p className="text-xs text-emerald-600 mt-1">Excellent Performance</p>
        </div>
      </div>
    </div>
  );
}

function StatusPieCard({ data, title }: any) {
  const total = data.reduce((sum: number, item: any) => sum + item.count, 0);
  const colors = ["#10b981", "#eab308", "#ef4444"];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-lg mb-6">{title}</h3>
      <div className="flex items-center gap-10">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {data.map((item: any, i: number) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="22"
                strokeDasharray={`${(item.count / total) * 100 * 2.38} 238`}
                strokeDashoffset={-i * 35}
              />
            ))}
          </svg>
        </div>
        <div className="space-y-4 flex-1">
          {data.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[i] }}
              />
              <span className="capitalize font-medium">{item.status}</span>
              <span className="ml-auto font-semibold">{item.count}</span>
            </div>
          ))}
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
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-lg mb-6">Notices Overview</h3>
      <div className="text-5xl font-bold text-slate-900 mb-1">
        {totalNotices}
      </div>
      <p className="text-slate-500">Total Published Notices</p>

      <div className="mt-8">
        <p className="text-xs font-semibold text-slate-500 mb-3">BY AUDIENCE</p>
        <div className="flex flex-wrap gap-2">
          {noticesByAudience.map((item: any, i: number) => (
            <div
              key={i}
              className="bg-slate-100 px-4 py-2.5 rounded-2xl text-sm font-medium"
            >
              {item.audienceType} ({item.count})
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-slate-500 mb-3">BY PRIORITY</p>
        <div className="flex flex-wrap gap-2">
          {noticesByPriority.map((item: any, i: number) => (
            <div
              key={i}
              className={`px-4 py-2.5 rounded-2xl text-sm font-medium ${
                item.priority === "HIGH"
                  ? "bg-red-100 text-red-700"
                  : item.priority === "MEDIUM"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {item.priority} ({item.count})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CriticalSubjectsCard({ referred, failed }: any) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-rose-500" /> Critical Subjects
      </h3>
      <div className="space-y-8">
        <div>
          <p className="text-rose-600 text-xs font-bold mb-3">
            TOP REFERRED SUBJECTS
          </p>
          {referred.slice(0, 5).map((item: any, i: number) => (
            <div
              key={i}
              className="flex justify-between py-2.5 border-t text-sm"
            >
              <span>{item.subject}</span>
              <span className="font-semibold text-rose-600">{item.count}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-red-600 text-xs font-bold mb-3">
            TOP FAILED SUBJECTS
          </p>
          {failed.slice(0, 5).map((item: any, i: number) => (
            <div
              key={i}
              className="flex justify-between py-2.5 border-t text-sm"
            >
              <span>{item.subject}</span>
              <span className="font-semibold text-red-600">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthlyBarChart({ title, data, type }: any) {
  const isAttendance = type === "attendance";
  const max = isAttendance
    ? Math.max(...data.map((d: any) => d.attendanceRate || 0), 1)
    : Math.max(...data.map((d: any) => d.passRate || 0), 1);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h3 className="font-semibold text-lg mb-6">{title}</h3>
      <div className="flex items-end gap-4 h-72 pt-4">
        {data.map((item: any, i: number) => {
          const value = isAttendance ? item.attendanceRate : item.passRate;
          const height = Math.max(30, (value / max) * 220);
          return (
            <div key={i} className="flex-1 flex flex-col items-center group">
              <span className="text-lg font-bold text-slate-700 mb-2">
                {value}%
              </span>
              <div
                className={`w-10 rounded-t-3xl transition-all group-hover:scale-105 ${isAttendance ? "bg-gradient-to-t from-blue-600 to-cyan-500" : "bg-gradient-to-t from-emerald-600 to-teal-500"}`}
                style={{ height: `${height}px` }}
              />
              <span className="text-xs text-slate-500 mt-4 font-medium">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentCard({ title, items, type }: any) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
      <h3 className="font-semibold text-lg mb-6">{title}</h3>
      <div className="space-y-4">
        {items.slice(0, 5).map((item: any) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors"
          >
            {type === "notice" ? (
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
            ) : (
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium line-clamp-2">{item.title}</p>
              <p className="text-xs text-slate-500 mt-2">
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
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-6 text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );
}
