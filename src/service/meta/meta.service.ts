"use server";

import { serverFetch } from "@/lib/server-fetch";
import { IAdminDashboard } from "@/types/meta.interface";

export async function getAdminDashboard(): Promise<
  IAdminDashboard | { success: false; message: string }
> {
  try {
    const response = await serverFetch.get("/meta/admin");
    const result = await response.json();
    return result.data;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// export async function getTeacherDashboard(): Promise<
//   ITeacherDashboard | { success: false; message: string }
// > {
//   try {
//     const response = await serverFetch.get("/meta/teacher");
//     const result = await response.json();
//     return result.data;
//   } catch (error: any) {
//     return { success: false, message: error.message };
//   }
// }

// export async function getStudentDashboard(): Promise<
//   IStudentDashboard | { success: false; message: string }
// > {
//   try {
//     const response = await serverFetch.get("/meta/student");
//     const result = await response.json();
//     return result.data;
//   } catch (error: any) {
//     return { success: false, message: error.message };
//   }
// }