"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverFetch } from "@/lib/server-fetch";
import { ICreateNoticePayload, INoticeFilterParams, IUpdateNoticePayload } from "@/types/notice.interface";
import { revalidateTag } from "next/cache";


export async function createNotice(prevState: any, formData: FormData) {
  try {
    const payload: ICreateNoticePayload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,

      attachmentUrl: formData.get("attachmentUrl")
        ? (formData.get("attachmentUrl") as string)
        : undefined,

      noticeDate: formData.get("noticeDate")
        ? (formData.get("noticeDate") as string)
        : undefined,

      expiryDate: formData.get("expiryDate")
        ? (formData.get("expiryDate") as string)
        : undefined,

      isPinned: formData.get("isPinned") === "true",

      isPublished: formData.get("isPublished") === "true",

      priority: formData.get("priority")
        ? (formData.get("priority") as any)
        : undefined,

      audienceType: formData.get("audienceType")
        ? (formData.get("audienceType") as any)
        : undefined,

      departmentId: formData.get("departmentId")
        ? Number(formData.get("departmentId"))
        : undefined,

      semesterId: formData.get("semesterId")
        ? Number(formData.get("semesterId"))
        : undefined,

      groupId: formData.get("groupId")
        ? Number(formData.get("groupId"))
        : undefined,

      studentId: formData.get("studentId")
        ? Number(formData.get("studentId"))
        : undefined,

      createdById: formData.get("createdById")
        ? Number(formData.get("createdById"))
        : undefined,
    };

    const response = await serverFetch.post("/notices", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("notice-list", "max");

      return {
        success: true,
        message: "Notice created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create notice",
    };
  } catch (error: any) {
    console.error("Create notice error:", error);

    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Create Notice Direct
// ─────────────────────────────────────────────────────────────

export async function createNoticeDirect(payload: ICreateNoticePayload) {
  try {
    const response = await serverFetch.post("/notices", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("notice-list", "max");

      return {
        success: true,
        message: "Notice created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create notice",
    };
  } catch (error: any) {
    console.error("Create notice error:", error);

    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Get All Notices
// ─────────────────────────────────────────────────────────────

export async function getNotices(params: INoticeFilterParams = {}) {
  try {
    const {
      searchTerm,
      audienceType,
      priority,
      departmentId,
      semesterId,
      groupId,
      studentId,
      isPinned,
      isPublished,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = params;

    const queryParams = new URLSearchParams();

    if (searchTerm) queryParams.append("searchTerm", searchTerm);

    if (audienceType) queryParams.append("audienceType", audienceType);

    if (priority) queryParams.append("priority", priority);

    if (departmentId) queryParams.append("departmentId", String(departmentId));

    if (semesterId) queryParams.append("semesterId", String(semesterId));

    if (groupId) queryParams.append("groupId", String(groupId));

    if (studentId) queryParams.append("studentId", String(studentId));

    if (isPinned !== undefined)
      queryParams.append("isPinned", String(isPinned));

    if (isPublished !== undefined)
      queryParams.append("isPublished", String(isPublished));

    if (sortBy) queryParams.append("sortBy", sortBy);

    if (sortOrder) queryParams.append("sortOrder", sortOrder);

    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const url = `/notices?${queryParams.toString()}`;

    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch notices: ${response.statusText}`);
    }

    const result = await response.json();

    const notices = Array.isArray(result.data) ? result.data : [];

    const total = result.meta?.total || notices.length;

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: notices,
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error: any) {
    console.error("Get notices error:", error);

    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch notices",

      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Get Single Notice
// ─────────────────────────────────────────────────────────────

export async function getNoticeById(id: number) {
  try {
    const response = await serverFetch.get(`/notices/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch notice: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data ?? result,
    };
  } catch (error: any) {
    console.error("Get notice error:", error);

    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch notice",

      data: null,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Update Notice
// ─────────────────────────────────────────────────────────────

export async function updateNotice(id: number, payload: IUpdateNoticePayload) {
  try {
    const response = await serverFetch.patch(`/notices/${id}`, {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("notice-list", "max");
      revalidateTag(`notice-${id}`, "max");

      return {
        success: true,
        message: "Notice updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update notice",
    };
  } catch (error: any) {
    console.error("Update notice error:", error);

    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Delete Notice
// ─────────────────────────────────────────────────────────────

export async function deleteNotice(id: number) {
  try {
    const response = await serverFetch.delete(`/notices/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag("notice-list", "max");

      return {
        success: true,
        message: "Notice deleted successfully!",
      };
    }

    return {
      success: false,
      message: result.message || "Failed to delete notice",
    };
  } catch (error: any) {
    console.error("Delete notice error:", error);

    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}
