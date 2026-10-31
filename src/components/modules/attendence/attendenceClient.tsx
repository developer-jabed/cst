/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Save, Loader2 } from "lucide-react";
import { createAttendanceSessionDirect } from "@/service/attendence/attendence.service";
import {
  AttendanceStatus,
  SessionMeta,
  STATUS_CONFIG,
  Student,
  SubjectGroup,
} from "@/types/attendence.interface";
import {
  SessionHeader,
  StatusBadge,
  SummaryBar,
  Toast,
  useToast,
} from "./Ui";

type RecordItem = { studentId: number; status: AttendanceStatus };

type Props = {
  students: Student[];
  subjectGroup: SubjectGroup;
  meta?: SessionMeta;
};

function StudentRow({
  student,
  index,
  status,
  onUpdate,
}: {
  student: Student;
  index: number;
  status: AttendanceStatus;
  onUpdate: (id: number, s: AttendanceStatus) => void;
}) {
  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarCls =
    status === "PRESENT"
      ? "bg-emerald-500"
      : status === "ABSENT"
        ? "bg-rose-500"
        : "bg-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.018, duration: 0.25 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:shadow-md"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarCls}`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {student.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Roll: {student.roll ?? "—"}
        </p>
      </div>
      <span className="hidden sm:block">
        <StatusBadge status={status} />
      </span>
      <div className="flex shrink-0 gap-1.5">
        {(["PRESENT", "ABSENT", "LATE"] as AttendanceStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = s === "PRESENT" ? Check : s === "ABSENT" ? X : Clock;
          return (
            <button
              key={s}
              onClick={() => onUpdate(student.id, s)}
              title={cfg.label}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-150 ${
                status === s ? cfg.activeCls : cfg.inactiveCls
              }`}
            >
              <Icon size={13} />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function AttendanceTakeClient({
  students,
  subjectGroup,
  meta,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<AttendanceStatus | "ALL">("ALL");
  const { toast, show: showToast } = useToast();

  const initialRecords = useMemo<RecordItem[]>(
    () => students.map((s) => ({ studentId: s.id, status: "PRESENT" })),
    [students]
  );
  const [records, setRecords] = useState<RecordItem[]>(initialRecords);

  const updateStatus = (studentId: number, status: AttendanceStatus) =>
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );

  const markAll = (status: AttendanceStatus) =>
    setRecords((prev) => prev.map((r) => ({ ...r, status })));

  const summary = useMemo(
    () => ({
      total: records.length,
      present: records.filter((r) => r.status === "PRESENT").length,
      absent: records.filter((r) => r.status === "ABSENT").length,
      late: records.filter((r) => r.status === "LATE").length,
    }),
    [records]
  );

  const filteredStudents = useMemo(() => {
    if (filter === "ALL") return students;
    return students.filter(
      (s) => records.find((r) => r.studentId === s.id)?.status === filter
    );
  }, [filter, students, records]);

  const recordsForBar = records.map((r) => ({
    id: r.studentId,
    studentId: r.studentId,
    attendanceSessionId: 0,
    status: r.status,
    student: { id: r.studentId },
  })) as any;

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await createAttendanceSessionDirect({
        session: {
          groupId: subjectGroup.groupId,
          subjectId: subjectGroup.subjectId,
          semesterId: subjectGroup.semesterId,
          teacherId: subjectGroup.teacherId,
          date: new Date().toISOString(),
          takenByRole: "TEACHER",
        },
        records,
      });
      if (res.success) showToast(true, "Attendance saved successfully!");
      else showToast(false, res.message || "Failed to save attendance.");
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <SessionHeader
        meta={meta ?? ({} as SessionMeta)}
        date={new Date().toISOString()}
        isLive
      />
      <SummaryBar records={recordsForBar} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-secondary/50 p-1 ring-1 ring-border">
          {(["ALL", "PRESENT", "ABSENT", "LATE"] as const).map((f) => {
            const count =
              f === "ALL"
                ? summary.total
                : summary[f.toLowerCase() as "present" | "absent" | "late"];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === f
                    ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {f === "ALL"
                  ? "All"
                  : f.charAt(0) + f.slice(1).toLowerCase()}{" "}
                ({count})
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          {(["PRESENT", "ABSENT", "LATE"] as AttendanceStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = s === "PRESENT" ? Check : s === "ABSENT" ? X : Clock;
            return (
              <button
                key={s}
                onClick={() => markAll(s)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${cfg.inactiveCls}`}
              >
                <Icon size={12} />
                All {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredStudents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="theme-card py-12 text-center text-muted-foreground"
            >
              No students in this filter.
            </motion.div>
          ) : (
            filteredStudents.map((student, index) => (
              <StudentRow
                key={student.id}
                student={student}
                index={index}
                status={
                  records.find((r) => r.studentId === student.id)?.status ??
                  "PRESENT"
                }
                onUpdate={updateStatus}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-4 z-10">
        <div className="theme-card flex items-center justify-between px-5 py-4 shadow-xl backdrop-blur-md">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">
              {summary.present}
            </span>{" "}
            present ·{" "}
            <span className="font-bold text-rose-600">{summary.absent}</span>{" "}
            absent ·{" "}
            <span className="font-bold text-amber-600">{summary.late}</span>{" "}
            late
          </p>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/30 transition hover:shadow-lg hover:shadow-primary/40 active:scale-95 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={15} /> Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}