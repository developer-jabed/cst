// ─── Shared Attendance Types ──────────────────────────────────────────────────

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type TakenByRole = "TEACHER" | "CR_STUDENT";

export interface AttendanceRecord {
  id: number;
  studentId: number;
  attendanceSessionId: number;
  status: AttendanceStatus;
  student: {
    id: number;
    name?: string;
    roll?: string | number;
    user?: { name?: string };
  };
}

export interface AttendanceSession {
  id: number;
  groupId: number;
  subjectId: number;
  semesterId: number;
  teacherId?: number;
  crStudentId?: number;
  takenByRole: TakenByRole;
  date: string; // ISO string
  createdAt: string;
  isDeleted: boolean;
  group?: {
    id: number;
    name?: string;
    department?: { name?: string };
    shift?: { name?: string };
  };
  semester?: { id: number; name?: string };
  subject?: { id: number; name?: string; code?: string; shortName?: string };
  teacher?: { id: number; name?: string; user?: { name?: string } };
  records?: AttendanceRecord[];
}

export interface SessionMeta {
  groupName?: string;
  semesterName?: string;
  teacherName?: string;
  subjectName?: string;
  subjectCode?: string;
  departmentName?: string;
  shiftName?: string;
}

export interface Student {
  id: number;
  name: string;
  roll?: string | number;
}

export interface SubjectGroup {
  groupId: number;
  subjectId: number;
  semesterId: number;
  teacherId?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  message?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  PRESENT: {
    label: "Present",
    short: "P",
    activeCls: "bg-emerald-600 text-white shadow-emerald-200 shadow-md",
    inactiveCls:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
    dotCls: "bg-emerald-500",
    badgeCls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    barCls: "bg-emerald-500",
    countCls: "text-emerald-600",
  },
  ABSENT: {
    label: "Absent",
    short: "A",
    activeCls: "bg-rose-600 text-white shadow-rose-200 shadow-md",
    inactiveCls:
      "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
    dotCls: "bg-rose-500",
    badgeCls: "bg-rose-50 text-rose-700 border border-rose-200",
    barCls: "bg-rose-500",
    countCls: "text-rose-600",
  },
  LATE: {
    label: "Late",
    short: "L",
    activeCls: "bg-amber-500 text-white shadow-amber-200 shadow-md",
    inactiveCls:
      "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
    dotCls: "bg-amber-400",
    badgeCls: "bg-amber-50 text-amber-700 border border-amber-200",
    barCls: "bg-amber-400",
    countCls: "text-amber-600",
  },
} as const;

export function resolveStudentName(
  student: AttendanceRecord["student"],
): string {
  return student?.name ?? student?.user?.name ?? "Unknown";
}

export function resolveTeacherName(
  teacher?: AttendanceSession["teacher"],
): string | undefined {
  return teacher?.name ?? teacher?.user?.name;
}

export function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatSessionTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSessionSummary(records: AttendanceRecord[]) {
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const attendanceRate = total ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, late, attendanceRate };
}

export function sessionMetaFromSession(
  session: AttendanceSession,
): SessionMeta {
  return {
    groupName: session.group?.name,
    semesterName: session.semester?.name,
    teacherName: resolveTeacherName(session.teacher),
    subjectName: session.subject?.name,
    subjectCode: session.subject?.code ?? session.subject?.shortName,
    departmentName: session.group?.department?.name,
    shiftName: session.group?.shift?.name,
  };
}
