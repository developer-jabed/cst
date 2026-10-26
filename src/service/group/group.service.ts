/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";


export async function getAllGroups(params: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  departmentId?: string | number;
  shiftId?: string | number;
  semesterId?: string | number;
  groupId?: string | number;
  all?: boolean;
} = {}) {
  try {
    const searchParams = new URLSearchParams();

    // Force high limit when we want ALL groups
    if (params.all) {
      searchParams.set("page", "1");
      searchParams.set("limit", "100"); // ← max allowed by your helper
    } else {
      if (params.page) searchParams.set("page", String(params.page));
      if (params.limit) searchParams.set("limit", String(params.limit));
    }

    if (params.searchTerm) searchParams.set("searchTerm", params.searchTerm);
    if (params.departmentId)
      searchParams.set("departmentId", String(params.departmentId));
    if (params.shiftId) searchParams.set("shiftId", String(params.shiftId));
    if (params.semesterId)
      searchParams.set("semesterId", String(params.semesterId));
    if (params.groupId) searchParams.set("groupId", String(params.groupId));

    const query = searchParams.toString();
    const url = query ? `/groups?${query}` : `/groups`;

    console.log("→ Calling URL:", url); // keep temporarily

    const response = await serverFetch.get(url);
    const result = await response.json();

    return result;
  } catch (error: any) {
    console.error("getAllGroups error:", error);
    return {
      success: false,
      message: error.message,
      meta: { page: 1, limit: 100, total: 0 },
      data: [],
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