/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { IAdminDashboard } from "@/types/meta.interface";
import { CACHE } from "@/lib/cache";

export async function getAdminDashboard(): Promise<
  IAdminDashboard | { success: false; message: string }
> {
  try {
    const response = await serverFetch.get("/meta/admin", {
      next: CACHE.adminDashboard,
    });

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
