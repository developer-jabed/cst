/* eslint-disable @typescript-eslint/no-explicit-any */
// service/department/department.service.ts
"use server"
import { serverFetch } from '@/lib/server-fetch';

export async function getAllDepartments(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.searchTerm) query.append('searchTerm', params.searchTerm);

    const response = await serverFetch.get(`/departments?${query.toString()}`);
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

export async function getDepartmentById(id: string | number) {
  try {
    const response = await serverFetch.get(`/departments/${id}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}