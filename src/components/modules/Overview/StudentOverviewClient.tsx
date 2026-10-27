/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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

export default function StudentOverviewClient({ data }: Props) {
  const { profile, summary, practicals, recentNotices } = data;

  const attendanceColor =
    summary.attendancePercentage >= 80
      ? "text-emerald-600"
      : summary.attendancePercentage >= 60
      ? "text-amber-600"
      : "text-rose-600";

  const attendanceBg =
    summary.attendancePercentage >= 80
      ? "bg-emerald-50 border-emerald-100"
      : summary.attendancePercentage >= 60
      ? "bg-amber-50 border-amber-100"
      : "bg-rose-50 border-rose-100";

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
              {profile.name
                ?.split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {profile.name}
              </h2>
              <p className="text-sm text-slate-500">
                Roll: {profile.roll} · {profile.registration}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {profile.department?.name} ·{" "}
                {profile.group?.name} ({profile.group?.session})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {profile.currentEnrollment?.semester?.name ||
                profile.currentSemester?.name ||
                "N/A"}
            </span>
            {profile.group?.shift && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {profile.group.shift.shortName}
              </span>
            )}
            {profile.currentEnrollment?.attemptNumber &&
              profile.currentEnrollment.attemptNumber > 1 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Attempt {profile.currentEnrollment.attemptNumber}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance */}
        <div
          className={`rounded-2xl border p-5 shadow-sm ${attendanceBg}`}
        >
          <p className="text-sm font-medium text-slate-600">Attendance</p>
          <p className={`mt-2 text-3xl font-bold ${attendanceColor}`}>
            {summary.attendancePercentage}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {summary.presentCount} / {summary.totalAttendanceRecords} classes
          </p>
        </div>

        {/* Total Classes */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Weekly Classes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {summary.totalClasses}
          </p>
          <p className="mt-1 text-xs text-slate-500">In your routine</p>
        </div>

        {/* Practicals Submitted */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Practicals Submitted
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {summary.submittedPracticals}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            out of {summary.totalPracticals}
          </p>
        </div>

        {/* Pending Practicals */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Pending Practicals
          </p>
          <p
            className={`mt-2 text-3xl font-bold ${
              summary.pendingPracticals > 0
                ? "text-rose-600"
                : "text-emerald-600"
            }`}
          >
            {summary.pendingPracticals}
          </p>
          <p className="mt-1 text-xs text-slate-500">Need submission</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Practicals List */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold text-slate-900">Practicals / Jobs</h3>
          </div>

          <div className="divide-y">
            {practicals.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No practicals assigned yet
              </div>
            ) : (
              practicals.slice(0, 6).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {item.practical?.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.practical?.subjectGroup?.subject?.name} ·{" "}
                      {item.practical?.type}
                    </p>
                  </div>

                  <div className="text-right">
                    {item.submitted ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Submitted
                        {item.obtainedMarks !== null &&
                          ` · ${item.obtainedMarks}/${item.practical?.totalMarks}`}
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold text-slate-900">Recent Notices</h3>
          </div>

          <div className="divide-y">
            {recentNotices.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">
                No notices available
              </div>
            ) : (
              recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start gap-3 px-5 py-3.5"
                >
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <div>
                    <p className="font-medium text-slate-800">
                      {notice.title}
                      {notice.isPinned && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          PINNED
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(notice.noticeDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {notice.priority}
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