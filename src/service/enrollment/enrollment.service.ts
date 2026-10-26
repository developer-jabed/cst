"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export async function promoteBatch(prevState: any, formData: FormData) {
  try {
    const fromGroupId = Number(formData.get("fromGroupId"));
    const fromSemesterId = Number(formData.get("fromSemesterId"));
    const toGroupId = Number(formData.get("toGroupId"));
    const toSemesterId = Number(formData.get("toSemesterId"));

    const errors: Record<string, string> = {};
    if (!fromGroupId || Number.isNaN(fromGroupId))
      errors.fromGroupId = "From group is required";
    if (!fromSemesterId || Number.isNaN(fromSemesterId))
      errors.fromSemesterId = "From semester is required";
    if (!toGroupId || Number.isNaN(toGroupId))
      errors.toGroupId = "To group is required";
    if (!toSemesterId || Number.isNaN(toSemesterId))
      errors.toSemesterId = "To semester is required";

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Please fill in all required fields.",
        errors,
      };
    }

    if (fromGroupId === toGroupId && fromSemesterId === toSemesterId) {
      return {
        success: false,
        message: "From and To cannot be exactly the same group + semester.",
        errors: { toSemesterId: "Must be different" },
      };
    }

    const data = {
      fromGroupId,
      fromSemesterId,
      toGroupId,
      toSemesterId,
    };

    const response = await serverFetch.post("/enrollments/promote-batch", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("students-list", "max");
      revalidateTag("groups-list", "max");
      revalidateTag("admin-dashboard-meta", "max");

      return {
        success: true,
        message: result.message || "Batch promoted successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to promote batch",
      errors: result.errors || {},
    };
  } catch (error: any) {
    console.error("Promote batch error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}
// ────────────────────────────────────────────────
// Manually promote/move a single student
// ────────────────────────────────────────────────
export async function promoteSingleStudent(prevState: any, formData: FormData) {
  try {
    const studentId = Number(formData.get("studentId"));
    const toSemesterId = Number(formData.get("toSemesterId"));
    const rawGroupId = formData.get("toGroupId");
    const toGroupId = rawGroupId ? Number(rawGroupId) : undefined;

    const errors: Record<string, string> = {};
    if (!studentId || Number.isNaN(studentId)) errors.studentId = "Student is required";
    if (!toSemesterId || Number.isNaN(toSemesterId))
      errors.toSemesterId = "Target semester is required";

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Please fill in all required fields.",
        errors,
      };
    }

    const data: {
      studentId: number;
      toSemesterId: number;
      toGroupId?: number;
    } = { studentId, toSemesterId };

    if (toGroupId && !Number.isNaN(toGroupId)) {
      data.toGroupId = toGroupId;
    }

    const response = await serverFetch.post("/enrollments/promote-student", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("students-list", "max");
      revalidateTag(`student-${studentId}`, "max");
      revalidateTag("groups-list", "max");

      return {
        success: true,
        message: result.message || "Student enrollment updated successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to promote student",
      errors: result.errors || {},
    };
  } catch (error: any) {
    console.error("Promote single student error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ────────────────────────────────────────────────
// Apply a diploma result — triggers PASS/RETAKE logic
// ────────────────────────────────────────────────
export async function applyDiplomaResult(prevState: any, formData: FormData) {
  try {
    const diplomaResultId = Number(formData.get("diplomaResultId"));

    if (!diplomaResultId || Number.isNaN(diplomaResultId)) {
      return {
        success: false,
        message: "Please enter a diploma result ID.",
        errors: { diplomaResultId: "Diploma result ID is required" },
      };
    }

    const data = { diplomaResultId };

    const response = await serverFetch.post("/enrollments/apply-result", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("results-list", "max");
      revalidateTag("students-list", "max");
      revalidateTag("admin-dashboard-meta", "max");

      return {
        success: true,
        message: result.message || "Result applied successfully!",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Failed to apply diploma result",
      errors: result.errors || {},
    };
  } catch (error: any) {
    console.error("Apply diploma result error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

// ────────────────────────────────────────────────
// Get a student's currently active enrollment
// ────────────────────────────────────────────────
export async function getActiveEnrollment(studentId: number) {
  try {
    const res = await serverFetch.get(`/enrollments/active/${studentId}`, {
      next: {
        tags: [`student-${studentId}`, "active-enrollment"],
        revalidate: 60,
      },
    });

    return await res.json();
  } catch (error: any) {
    console.error("Get active enrollment error:", error);
    return {
      success: false,
      message: "Failed to fetch active enrollment",
      data: null,
    };
  }
}

// ────────────────────────────────────────────────
// Get a student's full enrollment/attempt history
// ────────────────────────────────────────────────
export async function getEnrollmentHistory(studentId: number) {
  try {
    const res = await serverFetch.get(`/enrollments/history/${studentId}`, {
      next: {
        tags: [`student-${studentId}`, "enrollment-history"],
        revalidate: 120,
      },
    });

    return await res.json();
  } catch (error: any) {
    console.error("Get enrollment history error:", error);
    return {
      success: false,
      message: "Failed to fetch enrollment history",
      data: [],
    };
  }
}