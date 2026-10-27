/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

// ─── Types (match getTeacherDashboard in the backend service) ─────────────────
export interface ITeacherDashboardOverview {
  totalSubjectGroups: number;
  totalStudentsTaught: number;
  totalSessionsTaken: number;
  totalPracticals: number;
  totalNoticesCreated: number;
  overallAttendanceRate: number;
}

export interface ITeacherSubjectGroup {
  id: number;
  subject: {
    id: number;
    name: string;
    shortName?: string | null;
    code: string;
  };
  group: { id: number; name: string; session: string };
  semester: { id: number; name: string };
  _count: { practicals: number };
}

export interface IMonthlyAttendance {
  label: string;
  year: number;
  month: number;
  sessions: number;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
}

export interface ITeacherRecentSession {
  id: number;
  date: string;
  subject: { id: number; name: string };
  group: { id: number; name: string };
  semester: { id: number; name: string };
  _count: { records: number };
}

export interface ITeacherNotice {
  id: number;
  title: string;
  audienceType: string;
  priority: string;
  isPublished?: boolean;
  createdAt: string;
  group?: { id: number; name: string } | null;
  student?: { id: number; name: string } | null;
}

export interface ITeacherDashboard {
  overview: ITeacherDashboardOverview;
  subjectGroups: ITeacherSubjectGroup[];
  monthly: {
    attendance: IMonthlyAttendance[];
    practicals: any[];
  };
  recentSessions: ITeacherRecentSession[];
  recent: {
    myNotices: ITeacherNotice[];
    feedNotices: ITeacherNotice[];
  };
}

export interface ITeacherDashboardResult {
  success: boolean;
  message?: string;
  data: ITeacherDashboard | null;
}

// Backend mount path of dashboardRoutes (e.g. router.use("/meta", dashboardRoutes))
const DASHBOARD_BASE = "/meta";

// রেসপন্স বডি নিরাপদে পড়ে
async function parseResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message: `সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি (${response.status})`,
    };
  }
}

// ─── Get Teacher Dashboard (meta data) ────────────────────────────────────────
export async function getTeacherDashboard(): Promise<ITeacherDashboardResult> {
  try {
    const response = await serverFetch.get(`${DASHBOARD_BASE}/teacher`);
    const result = await parseResponse(response);

    if (!result?.success) {
      return {
        success: false,
        message: result?.message || "ড্যাশবোর্ড ডেটা লোড করা যায়নি!",
        data: null,
      };
    }

    return {
      success: true,
      message: result.message,
      data: result.data as ITeacherDashboard,
    };
  } catch (error: any) {
    console.error("getTeacherDashboard error:", error);
    return {
      success: false,
      message: error.message || "ড্যাশবোর্ড ডেটা লোড করা যায়নি!",
      data: null,
    };
  }
}