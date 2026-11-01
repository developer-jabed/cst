/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { CACHE } from "@/lib/cache";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IOverviewSummary {
  // Common
  totalClasses?: number;

  // Teacher
  totalSubjectGroups?: number;
  totalAttendanceTaken?: number;
  totalPracticals?: number;

  // Student
  attendancePercentage?: number;
  totalAttendanceRecords?: number;
  presentCount?: number;
  submittedPracticals?: number;
  pendingPracticals?: number;
}

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

// ─── Get My Overview (Teacher + Student) ──────────────────────────────────────
export async function getMyOverview() {
  try {
    const response = await serverFetch.get("/overview/my", {
      next: CACHE.overview,
    });

    return await parseResponse(response);
  } catch (error: any) {
    console.error("getMyOverview error:", error);
    return {
      success: false,
      message: error.message || "ওভারভিউ লোড করা যায়নি!",
      data: null,
    };
  }
}
