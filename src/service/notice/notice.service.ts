"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverFetch } from "@/lib/server-fetch";
import {
  ICreateNoticePayload,
  INoticeFilterParams,
  IUpdateNoticePayload,
  IViewerContext,
} from "@/types/notice.interface";
import { revalidateTag } from "next/cache";

const toISODateTime = (
  value: FormDataEntryValue | null,
): string | undefined => {
  if (!value || typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const toNumber = (value: FormDataEntryValue | null): number | undefined => {
  if (!value) return undefined;
  const n = Number(value);
  return isNaN(n) ? undefined : n;
};

export async function createNotice(prevState: any, formData: FormData) {
  try {
    const payload: ICreateNoticePayload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,

      attachmentUrl: formData.get("attachmentUrl")
        ? (formData.get("attachmentUrl") as string)
        : undefined,

      noticeDate: toISODateTime(formData.get("noticeDate")),
      expiryDate: toISODateTime(formData.get("expiryDate")),

      isPinned: formData.get("isPinned") === "true",
      isPublished: formData.get("isPublished") === "true",

      priority: (formData.get("priority") as any) || undefined,
      audienceType: (formData.get("audienceType") as any) || undefined,

      departmentId: toNumber(formData.get("departmentId")),
      semesterId: toNumber(formData.get("semesterId")),
      groupId: toNumber(formData.get("groupId")),
      studentId: toNumber(formData.get("studentId")),
      teacherId: toNumber(formData.get("teacherId")),
      createdById: toNumber(formData.get("createdById")),
    };

    const response = await serverFetch.post("/notices", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
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

export async function createNoticeDirect(payload: ICreateNoticePayload) {
  try {
    const normalizedPayload: ICreateNoticePayload = {
      ...payload,
      noticeDate: payload.noticeDate
        ? new Date(payload.noticeDate).toISOString()
        : undefined,
      expiryDate: payload.expiryDate
        ? new Date(payload.expiryDate).toISOString()
        : undefined,
    };

    const response = await serverFetch.post("/notices", {
      body: JSON.stringify(normalizedPayload),
      headers: { "Content-Type": "application/json" },
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

const NUMERIC_FILTER_FIELDS = [
  "departmentId",
  "semesterId",
  "groupId",
  "studentId",
  "teacherId",
  "createdById",
] as const;

const coerceFilterData = (
  filterData: Record<string, any>,
): Record<string, any> => {
  const coerced: Record<string, any> = {};

  for (const [key, value] of Object.entries(filterData)) {
    if (NUMERIC_FILTER_FIELDS.includes(key as any)) {
      const num = Number(value);
      coerced[key] = isNaN(num) ? undefined : num;
    } else {
      coerced[key] = value;
    }
  }

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(coerced).filter(([, v]) => v !== undefined),
  );
};

export async function getNotices(
  params: INoticeFilterParams = {},
  viewerContext?: IViewerContext,
) {
  try {
    const {
      searchTerm,
      audienceType,
      priority,
      departmentId,
      semesterId,
      groupId,
      studentId,
      teacherId,
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
    if (teacherId) queryParams.append("teacherId", String(teacherId));
    if (isPinned !== undefined)
      queryParams.append("isPinned", String(isPinned));
    if (isPublished !== undefined)
      queryParams.append("isPublished", String(isPublished));
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);

    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    if (viewerContext) {
      queryParams.append("viewerRole", viewerContext.role);

      if (viewerContext.role === "student") {
        queryParams.append("studentId", String(viewerContext.studentId));
        if (viewerContext.groupId)
          queryParams.append("groupId", String(viewerContext.groupId));
        if (viewerContext.semesterId)
          queryParams.append("semesterId", String(viewerContext.semesterId));
        if (viewerContext.departmentId)
          queryParams.append(
            "departmentId",
            String(viewerContext.departmentId),
          );
      }

      if (viewerContext.role === "teacher") {
        queryParams.append("teacherId", String(viewerContext.teacherId));
        if (viewerContext.departmentId)
          queryParams.append(
            "departmentId",
            String(viewerContext.departmentId),
          );
      }

      if (viewerContext.role === "group") {
        queryParams.append("groupId", String(viewerContext.groupId));
        if (viewerContext.semesterId)
          queryParams.append("semesterId", String(viewerContext.semesterId));
        if (viewerContext.departmentId)
          queryParams.append(
            "departmentId",
            String(viewerContext.departmentId),
          );
      }
    }

    const response = await serverFetch.get(
      `/notices?${queryParams.toString()}`,
    );

    // ✅ Always parse first so we can surface the real backend error
    const result = await response.json();

    if (!response.ok) {
      console.error("Notices backend error:", result);
      return {
        success: false,
        message:
          result?.message ||
          result?.error ||
          `Failed to fetch notices: ${response.statusText}`,
        data: [],
        total: 0,
        totalPages: 1,
        currentPage: page,
      };
    }

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
      headers: { "Content-Type": "application/json" },
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
