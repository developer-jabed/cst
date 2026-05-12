import { getAttendanceSessionById } from "@/service/attendence/attendence.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getSessionSummary,
  resolveStudentName,
  sessionMetaFromSession,
} from "@/types/attendence.interface";
import {
  SessionHeader,
  StatusBadge,
  SummaryBar,
} from "@/components/modules/attendence/Ui";

export const dynamic = "force-dynamic";

export default async function AttendanceSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;

  const res = await getAttendanceSessionById(Number(sessionId));

  if (!res.success || !res.data) return notFound();

  const session = res.data;
  const meta = sessionMetaFromSession(session);
  const records = session.records ?? [];
  const { attendanceRate } = getSessionSummary(records as any);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Back */}
        <Link
          href={`/teacher/dashboard/attendence/${id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={13} />
          Back to Sessions
        </Link>
        {/* Header */}
        <SessionHeader meta={meta} date={session.date} isLive={false} />

        {/* Summary */}
        <SummaryBar records={records as any} />

        {/* Attendance rate card */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            Overall Attendance Rate
          </p>
          <div className="flex items-center gap-3">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  attendanceRate >= 80
                    ? "bg-emerald-500"
                    : attendanceRate >= 60
                      ? "bg-amber-400"
                      : "bg-rose-500"
                }`}
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <span
              className={`text-sm font-bold ${
                attendanceRate >= 80
                  ? "text-emerald-600"
                  : attendanceRate >= 60
                    ? "text-amber-600"
                    : "text-rose-600"
              }`}
            >
              {attendanceRate}%
            </span>
          </div>
        </div>

        {/* Records table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-sm font-semibold text-slate-700">
              Student Records{" "}
              <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {records.length}
              </span>
            </p>
          </div>
          {records.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No records for this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["#", "Student", "Roll", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: any, index: number) => {
                    const name = resolveStudentName(record.student);
                    const initials = name
                      .split(" ")
                      .map((w: string) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    const avatarCls =
                      record.status === "PRESENT"
                        ? "bg-emerald-500"
                        : record.status === "ABSENT"
                          ? "bg-rose-500"
                          : "bg-amber-400";

                    return (
                      <tr
                        key={record.id}
                        className="border-b border-slate-50 transition-colors hover:bg-indigo-50/30"
                      >
                        <td className="px-5 py-3 text-xs font-medium text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarCls}`}
                            >
                              {initials}
                            </div>
                            <span className="text-sm font-semibold text-slate-800">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500">
                          {record.student?.roll ?? "—"}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={record.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
