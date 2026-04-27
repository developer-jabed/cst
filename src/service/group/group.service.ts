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

   

    const response = await serverFetch.get(`/groups`);
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