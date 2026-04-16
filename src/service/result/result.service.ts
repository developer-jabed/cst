/* eslint-disable @typescript-eslint/no-explicit-any */
// service/result/result.service.ts
"use server"
import { serverFetch } from '@/lib/server-fetch';

export async function getAllResults(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  semester?: string;
  instituteCode?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params.page)        query.append('page',         String(params.page));
    if (params.limit)       query.append('limit',        String(params.limit));
    if (params.searchTerm)  query.append('searchTerm',   params.searchTerm);
    if (params.semester)    query.append('semester',     params.semester);
    if (params.instituteCode) query.append('instituteCode', params.instituteCode);

    const response = await serverFetch.get(`/results?${query.toString()}`);
    const result   = await response.json();
    // shape: { meta: { page, limit, total }, data: [...] }
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getResultByRoll(roll: string) {
  try {
    const response = await serverFetch.get(`/results/${roll}`);
    const result   = await response.json();
    // shape: { success: true, message: "...", data: { ...result, student: {...} } }
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}