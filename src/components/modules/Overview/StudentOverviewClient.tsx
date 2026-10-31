/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  CalendarCheck,
  FlaskConical,
  AlertCircle,
  BookOpen,
  Pin,
  Megaphone,
} from "lucide-react";

type OverviewData = {
  role: "STUDENT";
  profile: {
    id: number;
    name: string;
    email: string;
    roll: string;
    registration: string;
    profilePhoto?: string | null;
    department?: {
      name: string;
      shortName: string;
    };
    group?: {
      name: string;
      session: string;
      currentSemester?: { name: string };
      shift?: { name: string; shortName: string };
    };
    currentSemester?: { name: string };
    currentEnrollment?: {
      attemptNumber: number;
      status: string;
      semester?: { name: string };
      group?: { name: string; session: string };
    };
  };
  summary: {
    attendancePercentage: number;
    totalAttendanceRecords: number;
    presentCount: number;
    totalClasses: number;
    totalPracticals: number;
    submittedPracticals: number;
    pendingPracticals: number;
  };
  practicals: any[];
  recentNotices: {
    id: number;
    title: string;
    priority: string;
    noticeDate: string;
    isPinned: boolean;
  }[];
};

interface Props {
  data: OverviewData;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function priorityBadge(priority: string) {
  const p = (priority || "").toUpperCase();
  if (p === "HIGH")
    return "bg-rose-50 text-rose-700 ring-rose-200";
  if (p === "MEDIUM")
    return "bg-amber-50 text-amber-800 ring-amber-200";
  if (p === "LOW")
    return "bg-sky-50 text-sky-700 ring-sky-200";
  return "bg-secondary text-muted-foreground ring-border";
}

export default function StudentOverviewClient({ data }: Props) {
  const { profile, summary, practicals, recentNotices } = data;

  const attendanceAccent =
    summary.attendancePercentage >= 80
      ? "from-emerald-500 to-teal-400"
      : summary.attendancePercentage >= 60
        ? "from-amber-500 to-yellow-400"
        : "from-rose-500 to-pink-400";

  const attendanceText =
    summary.attendancePercentage >= 80
      ? "text-emerald-600"
      : summary.attendancePercentage >= 60
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-600 text-xl font-black text-primary-foreground shadow-md shadow-primary/30">
              {profile.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(profile.name)
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Roll: {profile.roll} · {profile.registration}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {profile.department?.name} · {profile.group?.name} (
                {profile.group?.session})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
              {profile.currentEnrollment?.semester?.name ||
                profile.currentSemester?.name ||
                "N/A"}
            </span>
            {profile.group?.shift && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border">
                {profile.group.shift.shortName}
              </span>
            )}
            {profile.currentEnrollment?.attemptNumber &&
              profile.currentEnrollment.attemptNumber > 1 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                  Attempt {profile.currentEnrollment.attemptNumber}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className={`h-1.5 w-full bg-gradient-to-r ${attendanceAccent}`} />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} className="text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Attendance
              </p>
            </div>
            <p className={`mt-2 text-3xl font-black tabular-nums ${attendanceText}`}>
              {summary.attendancePercentage}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.presentCount} / {summary.totalAttendanceRecords} classes
            </p>
          </div>
        </div>

        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-400" />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Weekly Classes
              </p>
            </div>
            <p className="mt-2 text-3xl font-black tabular-nums text-foreground">
              {summary.totalClasses}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">In your routine</p>
          </div>
        </div>

        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <FlaskConical size={14} className="text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Practicals Submitted
              </p>
            </div>
            <p className="mt-2 text-3xl font-black tabular-nums text-primary">
              {summary.submittedPracticals}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              out of {summary.totalPracticals}
            </p>
          </div>
        </div>

        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div
            className={`h-1.5 w-full bg-gradient-to-r ${
              summary.pendingPracticals > 0
                ? "from-rose-500 to-pink-400"
                : "from-emerald-500 to-teal-400"
            }`}
          />
          <div className="p-5">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pending Practicals
              </p>
            </div>
            <p
              className={`mt-2 text-3xl font-black tabular-nums ${
                summary.pendingPracticals > 0
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              {summary.pendingPracticals}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Need submission</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Practicals */}
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
          <div className="border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FlaskConical size={16} className="text-primary" />
              Practicals / Jobs
            </h3>
          </div>

          <div className="divide-y divide-border">
            {practicals.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                No practicals assigned yet
              </div>
            ) : (
              practicals.slice(0, 6).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3.5 transition hover:bg-secondary/30"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {item.practical?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.practical?.subjectGroup?.subject?.name} ·{" "}
                      {item.practical?.type}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {item.submitted ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        Submitted
                        {item.obtainedMarks !== null &&
                          item.obtainedMarks !== undefined &&
                          ` · ${item.obtainedMarks}/${item.practical?.totalMarks}`}
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-yellow-400" />
          <div className="border-b border-border px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Megaphone size={16} className="text-amber-600" />
              Recent Notices
            </h3>
          </div>

          <div className="divide-y divide-border">
            {recentNotices.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                No notices available
              </div>
            ) : (
              recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-secondary/30"
                >
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {notice.title}
                      {notice.isPinned && (
                        <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 ring-1 ring-inset ring-amber-200">
                          <Pin size={10} />
                          PINNED
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(notice.noticeDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      ·{" "}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${priorityBadge(
                          notice.priority
                        )}`}
                      >
                        {notice.priority}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}