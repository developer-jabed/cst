"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type TakenByRole = "TEACHER" | "CR_STUDENT";

export interface IAttendanceRecordInput {
  studentId: number;
  status: AttendanceStatus;
}

export interface ICreateAttendanceSessionPayload {
  groupId: number;
  subjectId: number;
  semesterId: number;
  date: string; // ISO date string e.g. "2025-01-15"
  teacherId?: number;
  crStudentId?: number;
  takenByRole: TakenByRole;
}

export interface ICreateAttendanceWithRecords {
  session: ICreateAttendanceSessionPayload;
  records: IAttendanceRecordInput[];
}

export interface IUpdateAttendanceRecord {
  studentId: number;
  status: AttendanceStatus;
}

export interface IAttendanceSessionFilterParams {
  groupId?: string | number;
  semesterId?: string | number;
  subjectId?: string | number;
  teacherId?: string | number;
  crStudentId?: string | number;
  takenByRole?: TakenByRole;
  date?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Session Actions ─────────────────────────────────────────────────────────

/**
 * POST /attendance
 * Create an attendance session along with student records.
 */
export async function createAttendanceSession(
  prevState: any,
  formData: FormData
) {
  try {
    // Parse records JSON string from form
    const recordsRaw = formData.get("records") as string;
    const records: IAttendanceRecordInput[] = recordsRaw
      ? JSON.parse(recordsRaw)
      : [];

    const payload: ICreateAttendanceWithRecords = {
      session: {
        groupId: Number(formData.get("groupId")),
        subjectId: Number(formData.get("subjectId")),
        semesterId: Number(formData.get("semesterId")),
        date: formData.get("date") as string,
        teacherId: formData.get("teacherId")
          ? Number(formData.get("teacherId"))
          : undefined,
        crStudentId: formData.get("crStudentId")
          ? Number(formData.get("crStudentId"))
          : undefined,
        takenByRole: formData.get("takenByRole") as TakenByRole,
      },
      records,
    };

    const response = await serverFetch.post("/attendance", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("attendance-list","max");
      revalidateTag("attendance-page-1 ","max");

      return { success: true, message: "Attendance session created successfully!", data: result.data };
    }

    return {
      success: false,
      message: result.message || "Failed to create attendance session",
      errors: result.errors || {},
    };
  } catch (error: any) {
    console.error("Create attendance session error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

/**
 * POST /attendance (direct JSON payload, non-form-action variant)
 * Use this when calling programmatically (not via useFormState).
 */
export async function createAttendanceSessionDirect(
  payload: ICreateAttendanceWithRecords
) {
  try {
    const response = await serverFetch.post("/attendance", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("attendance-list","max");
      revalidateTag("attendance-page-1","ma");
      return { success: true, message: "Attendance session created successfully!", data: result.data };
    }

    return {
      success: false,
      message: result.message || "Failed to create attendance session",
    };
  } catch (error: any) {
    console.error("Create attendance session error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

/**
 * GET /attendance
 * Fetch all attendance sessions with optional filters & pagination.
 */
export async function getAttendanceSessions(
  params: IAttendanceSessionFilterParams = {}
) {
  try {
    const {
      groupId,
      semesterId,
      subjectId,
      teacherId,
      crStudentId,
      takenByRole,
      date,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = params;

    const queryParams = new URLSearchParams();

    if (groupId) queryParams.append("groupId", String(groupId));
    if (semesterId) queryParams.append("semesterId", String(semesterId));
    if (subjectId) queryParams.append("subjectId", String(subjectId));
    if (teacherId) queryParams.append("teacherId", String(teacherId));
    if (crStudentId) queryParams.append("crStudentId", String(crStudentId));
    if (takenByRole) queryParams.append("takenByRole", takenByRole);
    if (date) queryParams.append("date", date);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const url = `/attendance?${queryParams.toString()}`;
    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance sessions: ${response.statusText}`);
    }

    const result = await response.json();

    const sessions = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
      ? result
      : [];

    const total = result.total || result.meta?.total || sessions.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: sessions,
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error: any) {
    console.error("Get attendance sessions error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch attendance sessions",
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

/**
 * GET /attendance/:id
 * Fetch a single attendance session by ID.
 */
export async function getAttendanceSessionById(id: number) {
  try {
    const response = await serverFetch.get(`/attendance/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data ?? result,
    };
  } catch (error: any) {
    console.error("Get attendance session by ID error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch attendance session",
      data: null,
    };
  }
}

/**
 * DELETE /attendance/:id
 * Soft-delete an attendance session.
 */
export async function deleteAttendanceSession(id: number) {
  try {
    const response = await serverFetch.delete(`/attendance/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag("attendance-list", "max");
      revalidateTag("attendance-page-1", "max");

      return { success: true, message: "Attendance session deleted successfully!" };
    }

    return {
      success: false,
      message: result.message || "Failed to delete attendance session",
    };
  } catch (error: any) {
    console.error("Delete attendance session error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─── Record Actions ───────────────────────────────────────────────────────────

/**
 * PATCH /attendance/:id/records
 * Upsert attendance records (present/absent/late) for a session.
 */
export async function updateAttendanceRecords(
  sessionId: number,
  records: IUpdateAttendanceRecord[]
) {
  try {
    const response = await serverFetch.patch(`/attendance/${sessionId}/records`, {
      body: JSON.stringify(records),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("attendance-list", "max");
      revalidateTag(`attendance-session-${sessionId}`, "max");

      return {
        success: true,
        message: "Attendance records updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update attendance records",
    };
  } catch (error: any) {
    console.error("Update attendance records error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

/**
 * PATCH /attendance/:id/records  (form-action variant)
 * Use with useFormState when updating records via a form.
 */
export async function updateAttendanceRecordsAction(
  prevState: any,
  formData: FormData
) {
  try {
    const sessionId = Number(formData.get("sessionId"));
    const recordsRaw = formData.get("records") as string;
    const records: IUpdateAttendanceRecord[] = recordsRaw
      ? JSON.parse(recordsRaw)
      : [];

    return await updateAttendanceRecords(sessionId, records);
  } catch (error: any) {
    console.error("Update attendance records action error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─── Student Summary Action ───────────────────────────────────────────────────

/**
 * GET /attendance/student/:studentId/semester/:semesterId
 * Get a student's full attendance records + per-subject summary for a semester.
 */
export async function getStudentAttendanceBySemester(
  studentId: number,
  semesterId: number
) {
  try {
    const response = await serverFetch.get(
      `/attendance/student/${studentId}/semester/${semesterId}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch student attendance: ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data ?? result,
      // data shape: { records: [...], summary: [...] }
    };
  } catch (error: any) {
    console.error("Get student attendance by semester error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch student attendance",
      data: null,
    };
  }
}