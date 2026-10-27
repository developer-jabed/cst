/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IStudentReportFilter {
  subjectGroupId?: number | string;
  groupId?: number | string;
}

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

// ─── Get All Students Report (under my subjects) ──────────────────────────────
export async function getMyStudentReports(params?: IStudentReportFilter) {
  try {
    const query = new URLSearchParams();

    if (params?.subjectGroupId)
      query.append("subjectGroupId", String(params.subjectGroupId));
    if (params?.groupId) query.append("groupId", String(params.groupId));

    const qs = query.toString();
    const response = await serverFetch.get(
      `/report/my-students${qs ? `?${qs}` : ""}`
    );

    return await parseResponse(response);
  } catch (error: any) {
    console.error("getMyStudentReports error:", error);
    return {
      success: false,
      message: error.message || "স্টুডেন্ট রিপোর্ট লোড করা যায়নি!",
      data: [],
    };
  }
}

// ─── Get Single Student Report ────────────────────────────────────────────────
export async function getStudentReport(
  subjectGroupId: number | string,
  studentId: number | string
) {
  try {
    const response = await serverFetch.get(
      `/report/subject-group/${subjectGroupId}/student/${studentId}`
    );

    return await parseResponse(response);
  } catch (error: any) {
    console.error("getStudentReport error:", error);
    return {
      success: false,
      message: error.message || "স্টুডেন্ট রিপোর্ট লোড করা যায়নি!",
      data: null,
    };
  }
}