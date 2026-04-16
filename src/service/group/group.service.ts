/* eslint-disable @typescript-eslint/no-explicit-any */

"use server"
import { serverFetch } from '@/lib/server-fetch';

export async function getAllGroups(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  departmentId?: string | number;
  shiftId?: string | number;
  semesterId?: string | number;
  groupId?: string | number;
}) {
  try {
    const query = new URLSearchParams();

    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.searchTerm) query.append('searchTerm', params.searchTerm);
    if (params.departmentId) query.append('departmentId', String(params.departmentId));
    if (params.shiftId) query.append('shiftId', String(params.shiftId));
    if (params.semesterId) query.append('semesterId', String(params.semesterId));
    if (params.groupId) query.append('groupId', String(params.groupId));

    const response = await serverFetch.get(`/groups?${query.toString()}`);
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

export async function getGroupById(id: string | number) {
  try {
    const response = await serverFetch.get(`/groups/${id}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}