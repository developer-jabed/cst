"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";


export type PracticalType = "PRACTICAL" | "JOB";

export interface ICreatePracticalPayload {
  subjectGroupId: number;
  title: string;
  totalMarks: number;
  type: PracticalType;
  givenDate?: string;      
  submissionDeadline?: string;
}

export interface IUpdatePracticalPayload {
  title?: string;
  totalMarks?: number;
  type?: PracticalType;
  givenDate?: string;
  submissionDeadline?: string;
}

export interface ICreateSubmissionPayload {
  practicalId: number;
  studentId: number;
  obtainedMarks?: number;
  submitted?: boolean;
}

export interface IUpdateSubmissionPayload {
  obtainedMarks?: number;
  submitted?: boolean;
}

export interface IBulkCreateSubmissionsPayload {
  practicalId: number;
  studentIds: number[];
}

export interface IBulkUpdateSubmissionItem {
  studentId: number;
  obtainedMarks?: number;
  submitted?: boolean;
}

export interface IBulkUpdateSubmissionsPayload {
  submissions: IBulkUpdateSubmissionItem[];
}

export interface IPracticalFilterParams {
  searchTerm?: string;
  subjectGroupId?: string | number;
  type?: PracticalType;
  title?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IPracticalSubmissionFilterParams {
  practicalId?: string | number;
  studentId?: string | number;
  submitted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}


export async function createPractical(prevState: any, formData: FormData) {
  try {
    const payload: ICreatePracticalPayload = {
      subjectGroupId: Number(formData.get("subjectGroupId")),
      title: formData.get("title") as string,
      totalMarks: Number(formData.get("totalMarks")),
      type: formData.get("type") as PracticalType,
      givenDate: formData.get("givenDate")
        ? (formData.get("givenDate") as string)
        : undefined,
      submissionDeadline: formData.get("submissionDeadline")
        ? (formData.get("submissionDeadline") as string)
        : undefined,
    };

    const response = await serverFetch.post("/practicals", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list","max");
      revalidateTag("practical-page-1","max");

      return {
        success: true,
        message: "Practical created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create practical",
      errors: result.errors || {},
    };
  } catch (error: any) {
    console.error("Create practical error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

/**
 * POST /practicals  (direct JSON payload, non-form-action variant)
 * Use when calling programmatically (not via useFormState).
 */
export async function createPracticalDirect(payload: ICreatePracticalPayload) {
  try {
    const response = await serverFetch.post("/practicals", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list","max");
      revalidateTag("practical-page-1","max");

      return {
        success: true,
        message: "Practical created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create practical",
    };
  } catch (error: any) {
    console.error("Create practical error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

/**
 * GET /practicals
 * Fetch all practicals with optional filters & pagination.
 */
export async function getPracticals(params: IPracticalFilterParams = {}) {
  try {
    const {
      searchTerm,
      subjectGroupId,
      type,
      title,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = params;

    const queryParams = new URLSearchParams();

    if (searchTerm) queryParams.append("searchTerm", searchTerm);
    if (subjectGroupId) queryParams.append("subjectGroupId", String(subjectGroupId));
    if (type) queryParams.append("type", type);
    if (title) queryParams.append("title", title);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const url = `/practicals?${queryParams.toString()}`;
    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch practicals: ${response.statusText}`);
    }

    const result = await response.json();

    const practicals = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
      ? result
      : [];

    const total = result.total || result.meta?.total || practicals.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: practicals,
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error: any) {
    console.error("Get practicals error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch practicals",
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

/**
 * GET /practicals/:id
 * Fetch a single practical by ID.
 */
export async function getPracticalById(id: number) {
  try {
    const response = await serverFetch.get(`/practicals/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch practical: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data ?? result,
    };
  } catch (error: any) {
    console.error("Get practical by ID error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch practical",
      data: null,
    };
  }
}


export async function updatePractical(
  id: number,
  payload: IUpdatePracticalPayload
) {
  try {
    const response = await serverFetch.patch(`/practicals/${id}`, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list","max");
      revalidateTag(`practical-${id}`,"max");

      return {
        success: true,
        message: "Practical updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update practical",
    };
  } catch (error: any) {
    console.error("Update practical error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function updatePracticalAction(
  prevState: any,
  formData: FormData
) {
  try {
    const id = Number(formData.get("id"));

    const payload: IUpdatePracticalPayload = {
      ...(formData.get("title") && { title: formData.get("title") as string }),
      ...(formData.get("totalMarks") && {
        totalMarks: Number(formData.get("totalMarks")),
      }),
      ...(formData.get("type") && {
        type: formData.get("type") as PracticalType,
      }),
      ...(formData.get("givenDate") && {
        givenDate: formData.get("givenDate") as string,
      }),
      ...(formData.get("submissionDeadline") && {
        submissionDeadline: formData.get("submissionDeadline") as string,
      }),
    };

    return await updatePractical(id, payload);
  } catch (error: any) {
    console.error("Update practical action error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function deletePractical(id: number) {
  try {
    const response = await serverFetch.delete(`/practicals/${id}`);

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list","max");
      revalidateTag("practical-page-1","max");

      return {
        success: true,
        message: "Practical deleted successfully!",
      };
    }

    return {
      success: false,
      message: result.message || "Failed to delete practical",
    };
  } catch (error: any) {
    console.error("Delete practical error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function createSubmissionDirect(
  payload: ICreateSubmissionPayload
) {
  try {
    const response = await serverFetch.post("/practicals/submissions", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list","max");
      revalidateTag(`practical-${payload.practicalId}`,"max");

      return {
        success: true,
        message: "Submission created successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to create submission",
    };
  } catch (error: any) {
    console.error("Create submission error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function createSubmission(prevState: any, formData: FormData) {
  try {
    const payload: ICreateSubmissionPayload = {
      practicalId: Number(formData.get("practicalId")),
      studentId: Number(formData.get("studentId")),
      obtainedMarks: formData.get("obtainedMarks")
        ? Number(formData.get("obtainedMarks"))
        : undefined,
      submitted: formData.get("submitted") === "true",
    };

    return await createSubmissionDirect(payload);
  } catch (error: any) {
    console.error("Create submission action error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function bulkCreateSubmissions(
  payload: IBulkCreateSubmissionsPayload
) {
  try {
    const response = await serverFetch.post("/practicals/submissions/bulk", {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list", "max");
      revalidateTag(`practical-${payload.practicalId}`,"max");

      return {
        success: true,
        message: "Submissions created successfully!",
        data: result.data, // { count: number }
      };
    }

    return {
      success: false,
      message: result.message || "Failed to bulk create submissions",
    };
  } catch (error: any) {
    console.error("Bulk create submissions error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function getSubmissions(
  params: IPracticalSubmissionFilterParams = {}
) {
  try {
    const {
      practicalId,
      studentId,
      submitted,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
    } = params;

    const queryParams = new URLSearchParams();

    if (practicalId) queryParams.append("practicalId", String(practicalId));
    if (studentId) queryParams.append("studentId", String(studentId));
    if (submitted !== undefined) queryParams.append("submitted", String(submitted));
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    const url = `/practicals/submissions?${queryParams.toString()}`;
    const response = await serverFetch.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch submissions: ${response.statusText}`);
    }

    const result = await response.json();

    const submissions = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
      ? result
      : [];

    const total = result.total || result.meta?.total || submissions.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: submissions,
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  } catch (error: any) {
    console.error("Get submissions error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch submissions",
      data: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}


export async function updateSubmission(
  practicalId: number,
  studentId: number,
  payload: IUpdateSubmissionPayload
) {
  try {
    const response = await serverFetch.patch(
      `/practicals/${practicalId}/submissions/${studentId}`,
      {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list", "max");
      revalidateTag(`practical-${practicalId}`, "max");

      return {
        success: true,
        message: "Submission updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to update submission",
    };
  } catch (error: any) {
    console.error("Update submission error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function updateSubmissionAction(
  prevState: any,
  formData: FormData
) {
  try {
    const practicalId = Number(formData.get("practicalId"));
    const studentId = Number(formData.get("studentId"));

    const payload: IUpdateSubmissionPayload = {
      ...(formData.get("obtainedMarks") !== null && {
        obtainedMarks: Number(formData.get("obtainedMarks")),
      }),
      ...(formData.get("submitted") !== null && {
        submitted: formData.get("submitted") === "true",
      }),
    };

    return await updateSubmission(practicalId, studentId, payload);
  } catch (error: any) {
    console.error("Update submission action error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function bulkUpdateSubmissions(
  practicalId: number,
  payload: IBulkUpdateSubmissionsPayload
) {
  try {
    const response = await serverFetch.patch(
      `/practicals/${practicalId}/submissions/bulk`,
      {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list", "max");
      revalidateTag(`practical-${practicalId}`, "max");

      return {
        success: true,
        message: "Submissions updated successfully!",
        data: result.data, // { count: number }
      };
    }

    return {
      success: false,
      message: result.message || "Failed to bulk update submissions",
    };
  } catch (error: any) {
    console.error("Bulk update submissions error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}


export async function deleteSubmission(
  practicalId: number,
  studentId: number
) {
  try {
    const response = await serverFetch.delete(
      `/practicals/${practicalId}/submissions/${studentId}`
    );

    const result = await response.json();

    if (result.success) {
      revalidateTag("practical-list","max");
      revalidateTag(`practical-${practicalId}`, "max");

      return {
        success: true,
        message: "Submission deleted successfully!",
      };
    }

    return {
      success: false,
      message: result.message || "Failed to delete submission",
    };
  } catch (error: any) {
    console.error("Delete submission error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}