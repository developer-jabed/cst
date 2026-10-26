"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export async function createSubject(prevState: any, formData: FormData) {
  try {
    const backendPayload = {
      name: formData.get("name") as string,
      shortName: formData.get("shortName") as string,
      code: formData.get("code") as string,
      semesterId: Number(formData.get("semesterId")),
      departmentId: Number(formData.get("departmentId")),
      credits: formData.get("credits")
        ? Number(formData.get("credits"))
        : undefined,
    };

    const response = await serverFetch.post("/subjects", {
      body: JSON.stringify(backendPayload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("subjects-list", "page");
      revalidateTag("subjects-page-1", "page");
      revalidateTag("admin-dashboard-meta", "page");

      return {
        success: true,
        message: "Subject created successfully!",
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create subject",
      errors: result.errors || {},
    };
  } catch (error: any) {
    console.error("Create subject error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

export async function getSubjects(
  params: {
    search?: string;
    departmentId?: string | number;
    semesterId?: string | number;
    page?: number;
    limit?: number;
  } = {},
) {
  try {
    const { search, departmentId, semesterId, page = 1, limit = 10 } = params;

    const queryParams = new URLSearchParams();

    // Backend expects searchTerm (not search)
    if (search) queryParams.append("searchTerm", search);
    if (departmentId) queryParams.append("departmentId", String(departmentId));
    if (semesterId) queryParams.append("semesterId", String(semesterId));
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const queryString = queryParams.toString();
    const url = `/subjects${queryString ? `?${queryString}` : ""}`;

    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.statusText}`);
    }

    const result = await response.json();

    const subjects = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    const total = result.meta?.total ?? result.total ?? subjects.length;
    const totalPages =
      result.meta?.totalPages ?? Math.ceil(total / limit) ?? 1;

    return {
      success: true,
      data: subjects,
      total,
      totalPages,
      currentPage: result.meta?.page ?? page,
      limit: result.meta?.limit ?? limit,
    };
  } catch (error: any) {
    console.error("Get subjects error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch subjects",
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

/** Semester-wise book list (all semesters grouped) */
export async function getSubjectsGroupedBySemester(params?: {
  departmentId?: string | number;
  searchTerm?: string;
}) {
  try {
    const queryParams = new URLSearchParams();

    if (params?.departmentId) {
      queryParams.append("departmentId", String(params.departmentId));
    }
    if (params?.searchTerm?.trim()) {
      queryParams.append("searchTerm", params.searchTerm.trim());
    }

    const queryString = queryParams.toString();
    const url = `/subjects/books/grouped${queryString ? `?${queryString}` : ""}`;

    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch grouped subjects: ${response.statusText}`,
      );
    }

    const result = await response.json();
    const data = Array.isArray(result.data) ? result.data : [];

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Get grouped subjects error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch semester-wise books",
      data: [],
    };
  }
}

/** Books of a single semester */
export async function getSubjectsBySemester(
  semesterId: number | string,
  params?: {
    departmentId?: string | number;
    searchTerm?: string;
  },
) {
  try {
    const queryParams = new URLSearchParams();

    if (params?.departmentId) {
      queryParams.append("departmentId", String(params.departmentId));
    }
    if (params?.searchTerm?.trim()) {
      queryParams.append("searchTerm", params.searchTerm.trim());
    }

    const queryString = queryParams.toString();
    const url = `/subjects/books/semester/${semesterId}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch semester subjects: ${response.statusText}`,
      );
    }

    const result = await response.json();
    const payload = result.data ?? result;

    return {
      success: true,
      data: {
        semester: payload.semester ?? null,
        totalBooks: payload.totalBooks ?? payload.books?.length ?? 0,
        books: Array.isArray(payload.books) ? payload.books : [],
      },
    };
  } catch (error: any) {
    console.error("Get subjects by semester error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch semester books",
      data: {
        semester: null,
        totalBooks: 0,
        books: [],
      },
    };
  }
}

export async function getSubjectById(id: number | string) {
  try {
    const response = await serverFetch.get(`/subjects/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch subject: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data || result,
    };
  } catch (error: any) {
    console.error("Get subject by id error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch subject",
      data: null,
    };
  }
}