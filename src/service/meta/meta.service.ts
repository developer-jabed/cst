/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { IAdminDashboard } from "@/types/meta.interface";

export async function getAdminDashboard(): Promise<
  IAdminDashboard | { success: false; message: string }
> {
  try {
    const response = await serverFetch.get("/meta/admin", {
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    const result = await response.json();
    return result.data;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
