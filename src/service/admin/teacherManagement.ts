"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createTeacherZodSchema } from "@/zod/teacher.validation";
import { revalidateTag } from "next/cache";

export async function createTeacher(prevState: any, formData: FormData) {
    try {

        console.log("=== FORM DATA ===", Object.fromEntries(formData.entries()));

        // ── Build validation payload ─────────────────────────────────────
        const validationPayload = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            mobile: formData.get("mobile") as string,
            designation: formData.get("designation") as string,
            departmentId: Number(formData.get("departmentId")),
            password: formData.get("password") as string,
            profilePhoto: formData.get("file") as File | null,
        };

        // ── Zod Validation ───────────────────────────────────────────────
        const validated = zodValidator(validationPayload, createTeacherZodSchema);
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
            teacher: {
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                designation: data.designation,
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
        const response = await serverFetch.post("/users/create-teacher", {
            body: newFormData,
        });

        console.log("=== RESPONSE STATUS ===", response.status);

        const result = await response.json();

        console.log("=== RESULT ===", result);

        if (result.success) {
            revalidateTag("teachers-list", "max");
            revalidateTag("teachers-page-1", "max");
            revalidateTag("admin-dashboard-meta", "max");

            return {
                success: true,
                message: "Teacher enrolled successfully!",
            };
        } else {
            return {
                success: false,
                message: result.message || "Failed to create teacher",
                errors: result.errors || {},
            };
        }
    } catch (error: any) {
        console.error("Create teacher error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Something went wrong. Please try again.",
        };
    }
}

export async function getAllTeachers(query?: Record<string, any>) {
    try {
        const page = query?.page || 1;

        // ✅ Filter out undefined/null values and convert all to string
        const cleanQuery: Record<string, string> = {};
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    cleanQuery[key] = String(value);
                }
            });
        }

        const queryString = new URLSearchParams(cleanQuery).toString();
        const url = `/teachers${queryString ? `?${queryString}` : ""}`;

        console.log("📡 [getAllTeachers] URL:", url);

        const res = await serverFetch.get(url, {
            next: {
                tags: [
                    "teachers-list",
                    `teachers-page-${page}`,
                ],
                revalidate: 120,
            },
        });

        const result = await res.json();
        console.log("📦 [getAllTeachers] Result:", result);

        return result;
    } catch (error: any) {
        console.error("Get teachers error:", error);

        return {
            success: false,
            message: "Failed to fetch teachers",
            data: [],
        };
    }
}