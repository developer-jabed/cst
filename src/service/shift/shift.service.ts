/* eslint-disable @typescript-eslint/no-explicit-any */
// service/shift/shift.service.ts
"use server"
import { serverFetch } from '@/lib/server-fetch';

export async function getAllShifts(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  departmentId?: string | number;
}) {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.searchTerm) query.append('searchTerm', params.searchTerm);
    if (params.departmentId) query.append('departmentId', String(params.departmentId));

    const response = await serverFetch.get(`/shifts?${query.toString()}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message,
      meta: { page: 1, limit: 10, total: 0 },
      data: [] 
    };
  }
}

export async function getShiftById(id: string | number) {
  try {
    const response = await serverFetch.get(`/shifts/${id}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}