/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createStudentZodSchema } from "@/zod/student.validation";
import { revalidateTag } from "next/cache";

export async function createStudent(prevState: any, formData: FormData) {
    try {

        console.log("=== FORM DATA ===", Object.fromEntries(formData.entries()));
        // ── Build validation payload ─────────────────────────────────────
        const validationPayload = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            roll: formData.get("roll") as string,
            registration: formData.get("registration") as string,
            mobile: formData.get("mobile") as string,
            gender: formData.get("gender") as string,
            birthDate: formData.get("birthDate") as string,
            birthnumber: formData.get("birthnumber") as string,
            nid: formData.get("nid") as string || undefined,
            fatherName: formData.get("fatherName") as string,
            motherName: formData.get("motherName") as string,
            fatherMobile: formData.get("fatherMobile") as string,
            motherMobile: formData.get("motherMobile") as string,
            presentAddress: formData.get("presentAddress") as string,
            permanentAddress: formData.get("permanentAddress") as string,
            groupId: Number(formData.get("groupId")),
            departmentId: Number(formData.get("departmentId")),
            password: formData.get("password") as string,
            profilePhoto: formData.get("file") as File | null,

        };

        // ── Zod Validation ───────────────────────────────────────────────
        const validated = zodValidator(validationPayload, createStudentZodSchema);
        console.log("=== VALIDATED ===", validated);

        if (!validated.success) {
            return {
                success: false,
                message: "Validation failed. Please check the highlighted fields.",
                errors: validated.errors || {},
            };
        }

        // TypeScript safety: validated.data is now guaranteed
        const data = validated.data!;

        // ── Prepare backend payload ──────────────────────────────────────
        const backendPayload = {
            password: data.password,
            student: {
                name: data.name,
                email: data.email,
                roll: data.roll,
                registration: data.registration,
                mobile: data.mobile,
                gender: data.gender,
                birthDate: data.birthDate,
                birthnumber: data.birthnumber,
                nid: data.nid,
                fatherName: data.fatherName,
                motherName: data.motherName,
                fatherMobile: data.fatherMobile,
                motherMobile: data.motherMobile,
                presentAddress: data.presentAddress,
                permanentAddress: data.permanentAddress,
                groupId: data.groupId,
                departmentId: data.departmentId,


            },
        };

        // ── Build multipart FormData ─────────────────────────────────────
        const newFormData = new FormData();
        newFormData.append("data", JSON.stringify(backendPayload));

        const file = formData.get("file") as File | null;
        if (file && file.size > 0) {
            newFormData.append("file", file);
        }

        // ── Call Backend ─────────────────────────────────────────────────
        const response = await serverFetch.post("/users/create-student", {
            body: newFormData,
        });

        console.log("=== RESPONSE STATUS ===", response.status);

        const result = await response.json();

        console.log("=== RESULT ===", result);

        if (result.success) {
            revalidateTag("students-list", "max");
            revalidateTag("students-page-1", "max");
            revalidateTag("admin-dashboard-meta", "max");
            return {
                success: true,
                message: "Student enrolled successfully!",
            };
        } else {
            return {
                success: false,
                message: result.message || "Failed to create student",
                errors: result.errors || {},
            };
        }
    } catch (error: any) {
        console.error("Create student error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}

// ========================= TYPES =========================

export interface StudentMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    roll: string;
    registration: string;
    mobile: string;
    gender: string;
    birthDate: string;
    birthnumber: string;
    nid: string | null;
    fatherName: string;
    motherName: string;
    fatherMobile: string;
    motherMobile: string;
    presentAddress: string;
    permanentAddress: string;
    profilePhoto: string | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    group: { id: number; name: string };
    department: { id: number; name: string };
    user: { id: number; email: string; role: string };
}

export interface StudentFilters {
    searchTerm?: string;
    departmentId?: string | number;
    groupId?: string | number;
    gender?: string;
    isDeleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}



// src/service/student/student.service.ts
export async function getStudents(filters: StudentFilters = {}) {
    try {
        const params = new URLSearchParams();

        if (filters.searchTerm)      params.set("searchTerm", filters.searchTerm);
        if (filters.departmentId)    params.set("departmentId", String(filters.departmentId));
        if (filters.groupId)         params.set("groupId", String(filters.groupId));
        if (filters.gender)          params.set("gender", filters.gender);
        if (filters.page)            params.set("page", String(filters.page));
        if (filters.limit)           params.set("limit", String(filters.limit));

        const queryString = params.toString();
        console.log("📡 [getStudents] Calling API with:", `/students?${queryString}`);

        const response = await serverFetch.get(`/students?${queryString}`, {
            next: {
                tags: ["students-list", `students-page-${filters.page ?? 1}`],
            },
        });

        const result = await response.json();

        return result.success ? {
            success: true,
            data: result.data || [],
            meta: result.meta || { page: 1, limit: 15, total: 0, totalPages: 1 },
        } : { 
            success: false, 
            message: result.message || "Failed to fetch students" 
        };

    } catch (error: any) {
        console.error("❌ [getStudents] Error:", error);
        return { success: false, message: "Failed to fetch students" };
    }
}


export async function getStudentById(id: number) {
    try {
        const response = await serverFetch.get(`/students/${id}`, {
            next: {
                tags: [`student-${id}`],
            },
        });

        const result = await response.json();

        if (!result.success) {
            return {
                success: false,
                message: result.message || "Student not found",
            };
        }

        return {
            success: true,
            data: result.data as Student,
        };
    } catch (error: any) {
        console.error("Get student by id error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}

// ========================= UPDATE STUDENT =========================

export async function updateStudent(prevState: any, formData: FormData) {
    try {
        const id = formData.get("id") as string;
        if (!id) return { success: false, message: "Student ID is required" };

        const payload: Record<string, any> = {};

        const fields = [
            "name", "mobile", "gender", "birthDate", "birthnumber",
            "nid", "fatherName", "motherName", "fatherMobile",
            "motherMobile", "presentAddress", "permanentAddress",
        ];

        for (const field of fields) {
            const val = formData.get(field);
            if (val !== null && val !== "") {
                payload[field] = val;
            }
        }

        const newFormData = new FormData();
        newFormData.append("data", JSON.stringify(payload));

        const file = formData.get("file");
        if (file instanceof File && file.size > 0 && file.name !== "undefined") {
            newFormData.append("file", file);
        }

        const response = await serverFetch.patch(`/students/${id}`, {
            body: newFormData,
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("students-list", "max");
            revalidateTag(`student-${id}`, "max");
            return { success: true, message: "Student updated successfully!" };
        }

        return {
            success: false,
            message: result.message || "Failed to update student",
            errors: result.errors || {},
        };
    } catch (error: any) {
        console.error("Update student error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}

// ========================= DELETE STUDENT =========================

export async function deleteStudent(id: number) {
    try {
        const response = await serverFetch.delete(`/students/${id}`);
        const result = await response.json();

        if (result.success) {
            revalidateTag("students-list", "max");
            revalidateTag("admin-dashboard-meta", "max");
            return { success: true, message: "Student deleted successfully!" };
        }

        return {
            success: false,
            message: result.message || "Failed to delete student",
        };
    } catch (error: any) {
        console.error("Delete student error:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}


export async function updateProfile(prevState: any, formData: FormData) {
    try {
        console.log("=== UPDATE PROFILE FORM DATA ===", Object.fromEntries(formData.entries()));

        const role = formData.get("role") as string; 

        if (!role || !["STUDENT", "TEACHER"].includes(role)) {
            return {
                success: false,
                message: "Invalid user role",
            };
        }

        // ── Build payload based on role ─────────────────────────────────────
        const payload: Record<string, any> = {};

        if (role === "TEACHER") {
            const teacherFields = ["name", "mobile", "designation", "departmentId"];

            for (const field of teacherFields) {
                const val = formData.get(field);
                if (val !== null && val !== "") {
                    payload[field] = val;
                }
            }

            // Wrap for backend
            const backendPayload = {
                teacher: payload
            };

            const newFormData = new FormData();
            newFormData.append("data", JSON.stringify(backendPayload));

            // Handle profile photo
            const file = formData.get("file") as File | null;
            if (file && file.size > 0) {
                newFormData.append("file", file);
            }

            // Call the single update API
            const response = await serverFetch.patch("/users/update-profile", {
                body: newFormData,
            });

            const result = await response.json();

            if (result.success) {
                revalidateTag("teacher-profile", "max");
                revalidateTag(`teacher-${formData.get("id")}`, "max");
                return {
                    success: true,
                    message: "Teacher profile updated successfully!",
                };
            }

            return {
                success: false,
                message: result.message || "Failed to update teacher profile",
                errors: result.errors || {},
            };

        } else if (role === "STUDENT") {
            const studentFields = [
                "name", "mobile", "gender", "birthDate", "birthnumber",
                "nid", "fatherName", "motherName", "fatherMobile",
                "motherMobile", "presentAddress", "permanentAddress",
            ];

            for (const field of studentFields) {
                const val = formData.get(field);
                if (val !== null && val !== "") {
                    payload[field] = val;
                }
            }

            // Wrap for backend (as expected by our API)
            const backendPayload = {
                student: payload
            };

            const newFormData = new FormData();
            newFormData.append("data", JSON.stringify(backendPayload));

            // Handle profile photo
            const file = formData.get("file") as File | null;
            if (file && file.size > 0) {
                newFormData.append("file", file);
            }

            const response = await serverFetch.patch("/users/update-profile", {
                body: newFormData,
            });

            const result = await response.json();

            if (result.success) {
                revalidateTag("students-list", "max");
                revalidateTag(`student-${formData.get("id") || "profile"}`, "max");
                return {
                    success: true,
                    message: "Student profile updated successfully!",
                };
            }

            return {
                success: false,
                message: result.message || "Failed to update student profile",
                errors: result.errors || {},
            };
        }

        return { success: false, message: "Invalid role" };

    } catch (error: any) {
        console.error("Update profile error:", error);

        return {
            success: false,
            message: process.env.NODE_ENV === "development"
                ? error.message
                : "Something went wrong. Please try again.",
        };
    }
}