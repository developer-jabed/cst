/* eslint-disable @typescript-eslint/no-explicit-any */
// service/result/result.service.ts
"use server";
import { serverFetch } from "@/lib/server-fetch";
import { CACHE } from "@/lib/cache";

export async function getAllResults(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  status?: string;
  semesterName?: string;
  examYear?: number | string;
  regulation?: string;
  instituteCode?: string;
  subjectCode?: string;
}) {
  try {
    const query = new URLSearchParams();

    query.append("page", String(params.page ?? 1));
    query.append("limit", String(params.limit ?? 10));
    query.append("sortBy", params.sortBy ?? "createdAt");
    query.append("sortOrder", params.sortOrder ?? "desc");

    if (params.searchTerm) query.append("searchTerm", params.searchTerm);
    if (params.status) query.append("status", params.status);
    if (params.semesterName) query.append("semesterName", params.semesterName);
    if (params.regulation) query.append("regulation", params.regulation);
    if (params.instituteCode) query.append("instituteCode", params.instituteCode);
    if (params.examYear) query.append("examYear", String(params.examYear));
    if (params.subjectCode) query.append("subjectCode", params.subjectCode);

    const response = await serverFetch.get(`/results?${query.toString()}`, {
      next: CACHE.results,
    });

    const result = await response.json();

    return result;
  } catch (error: any) {
    console.error("getAllResults error:", error);
    return { success: false, message: error.message };
  }
}

export async function getResultByRoll(roll: string) {
  try {
    const response = await serverFetch.get(`/results/${roll}`, {
      next: CACHE.resultByRoll(roll),
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getResultByRollAndSemester(
  roll: string,
  semesterName: string,
  examYear: number,
  regulation: string,
) {
  try {
    const query = new URLSearchParams({
      semesterName,
      examYear: String(examYear),
      regulation,
    });
    const response = await serverFetch.get(
      `/results/${roll}/semester?${query.toString()}`,
      {
        next: CACHE.resultByRoll(roll),
      },
    );
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getSubjectWiseReport(params?: {
  type?: "REFERRED" | "FAILED";
  semesterName?: string;
  examYear?: number;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.semesterName) query.append("semesterName", params.semesterName);
    if (params?.examYear) query.append("examYear", String(params.examYear));

    const qs = query.toString();
    const response = await serverFetch.get(
      `/results/subject-wise-report${qs ? `?${qs}` : ""}`,
      {
        next: {
          revalidate: 300,
          tags: ["results-list", "subject-wise-report"],
        },
      },
    );
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("getSubjectWiseReport error:", error);
    return { success: false, message: error.message };
  }
}
