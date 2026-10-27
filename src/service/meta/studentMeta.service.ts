/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

// ─── Types (match getStudentDashboard in the backend service) ─────────────────
// NOTE: the backend currently returns placeholders for overview / attendance /
// practicals / diploma. Those are typed loosely below — tighten them once the
// backend shape is final.

export interface IStudentMonthlyAttendance {
  label: string;
  year: number;
  month: number;
  present: number;
  absent: number;
  late: number;
  total: number;
  attendanceRate: number;
}

export interface IStudentNotice {
  id: number;
  title: string;
  audienceType: string;
  priority: string;
  isPublished?: boolean;
  createdAt: string;
  group?: { id: number; name: string } | null;
  student?: { id: number; name: string } | null;
}

export interface IStudentDashboard {
  overview: Record<string, any>;
  attendance: Record<string, any>;
  practicals: Record<string, any>;
  diploma: Record<string, any>;
  monthly: {
    attendance: IStudentMonthlyAttendance[];
    practicals?: any[];
    marks?: any[];
  };
  recent: {
    myNotices: IStudentNotice[];
    feedNotices: IStudentNotice[];
  };
}

export interface IStudentDashboardResult {
  success: boolean;
  message?: string;
  data: IStudentDashboard | null;
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

// ─── Get Student Dashboard (meta data) ────────────────────────────────────────
export async function getStudentDashboard(): Promise<IStudentDashboardResult> {
  try {
    const response = await serverFetch.get(`${DASHBOARD_BASE}/student`);
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
      data: result.data as IStudentDashboard,
    };
  } catch (error: any) {
    console.error("getStudentDashboard error:", error);
    return {
      success: false,
      message: error.message || "ড্যাশবোর্ড ডেটা লোড করা যায়নি!",
      data: null,
    };
  }
}