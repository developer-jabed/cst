/* eslint-disable @typescript-eslint/no-explicit-any */
// service/result/result.service.ts
"use server"
import { serverFetch } from '@/lib/server-fetch';

export async function getAllResults(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  status?: string;
  semesterName?: string;
  examYear?: number | string;
  regulation?: string;
  instituteCode?: string;
}) {
  try {
    const query = new URLSearchParams();

    // Always append page and limit
    query.append('page', String(params.page ?? 1));
    query.append('limit', String(params.limit ?? 10));
    query.append('sortBy', params.sortBy ?? 'createdAt');
    query.append('sortOrder', params.sortOrder ?? 'desc');

    if (params.searchTerm) query.append('searchTerm', params.searchTerm);
    if (params.status) query.append('status', params.status);
    if (params.semesterName) query.append('semesterName', params.semesterName);
    if (params.regulation) query.append('regulation', params.regulation);
    if (params.instituteCode) query.append('instituteCode', params.instituteCode);
    if (params.examYear) query.append('examYear', String(params.examYear));

    console.log("getAllResults query:", query.toString()); // debug

    const response = await serverFetch.get(`/results?${query.toString()}`);

    console.log("getAllResults status:", response.status);

    const result = await response.json();

    console.log("getAllResults response:", JSON.stringify(result, null, 2)); // debug

    return result;
  } catch (error: any) {
    console.error("getAllResults error:", error);
    return { success: false, message: error.message };
  }
}

export async function getResultByRoll(roll: string) {
  try {
    const response = await serverFetch.get(`/results/${roll}`);
    const result = await response.json();
    // shape: DiplomaResult[] ordered by examYear desc,
    // each with: student, semester, group relations
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
    const query = new URLSearchParams({ semesterName, examYear: String(examYear), regulation });
    const response = await serverFetch.get(`/results/${roll}/semester?${query.toString()}`);
    const result = await response.json();
    // shape: single DiplomaResult with student, semester, group relations
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}