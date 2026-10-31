/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <Link
          href={`/teacher/dashboard/attendence/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back to Sessions
        </Link>

        <SessionHeader meta={meta} date={session.date} isLive={false} />
        <SummaryBar records={records as any} />

        {/* Attendance rate */}
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-semibold text-foreground">
              Overall Attendance Rate
            </p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-40 overflow-hidden rounded-full bg-border">
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
                className={`text-sm font-black tabular-nums ${
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
        </div>

        {/* Records table */}
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-400" />
          <div className="border-b border-border bg-secondary/40 px-5 py-3">
            <p className="text-sm font-bold text-foreground">
              Student Records{" "}
              <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground ring-1 ring-border">
                {records.length}
              </span>
            </p>
          </div>

          {records.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No records for this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["#", "Student", "Roll", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
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
                        className="border-b border-border last:border-0 transition hover:bg-secondary/30"
                      >
                        <td className="px-5 py-3 text-xs font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarCls}`}
                            >
                              {initials}
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">
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