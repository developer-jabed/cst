/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface IRoutineFilter {
  groupId?: number | string;
  dayOfWeek?: number;
  semesterId?: number | string;
}

export interface ICreateRoutinePayload {
  groupId: number;
  subjectId: number;
  teacherId: number;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  room?: string;
  isActive?: boolean;
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

// ─── Get All Routines ─────────────────────────────────────────────────────────
export async function getAllRoutines(params?: IRoutineFilter) {
  try {
    const query = new URLSearchParams();

    if (params?.groupId) query.append("groupId", String(params.groupId));
    if (params?.dayOfWeek !== undefined)
      query.append("dayOfWeek", String(params.dayOfWeek));
    if (params?.semesterId)
      query.append("semesterId", String(params.semesterId));

    const qs = query.toString();
    const response = await serverFetch.get(`/routine${qs ? `?${qs}` : ""}`);

    return await parseResponse(response);
  } catch (error: any) {
    console.error("getAllRoutines error:", error);
    return {
      success: false,
      message: error.message || "রুটিন লোড করা যায়নি!",
      data: [],
    };
  }
}

// ─── Get Routine by Group ─────────────────────────────────────────────────────
export async function getRoutineByGroup(groupId: number | string) {
  try {
    const response = await serverFetch.get(`/routine/group/${groupId}`);

    return await parseResponse(response);
  } catch (error: any) {
    console.error("getRoutineByGroup error:", error);
    return {
      success: false,
      message: error.message || "গ্রুপের রুটিন লোড করা যায়নি!",
      data: [],
    };
  }
}

// ─── Get My Routines (Teacher + Student) ──────────────────────────────────────
export async function getMyRoutines() {
  try {
    const response = await serverFetch.get("/routine/my");

    return await parseResponse(response);
  } catch (error: any) {
    console.error("getMyRoutines error:", error);
    return {
      success: false,
      message: error.message || "আমার রুটিন লোড করা যায়নি!",
      data: [],
    };
  }
}

// ─── Create Routine ───────────────────────────────────────────────────────────
export async function createRoutine(payload: ICreateRoutinePayload) {
  try {
    const response = await serverFetch.post("/routine", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await parseResponse(response);
  } catch (error: any) {
    console.error("createRoutine error:", error);
    return {
      success: false,
      message: error.message || "রুটিন তৈরি করা যায়নি!",
    };
  }
}