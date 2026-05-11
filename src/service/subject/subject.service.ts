"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export async function createSubject(prevState: any, formData: FormData) {
    try {
        console.log("=== FORM DATA ===", Object.fromEntries(formData.entries()));

        const backendPayload = {
            name: formData.get("name") as string,
            shortName: formData.get("shortName") as string,
            code: formData.get("code") as string,
            semesterId: Number(formData.get("semesterId")),
            departmentId: Number(formData.get("departmentId")),
            credits: formData.get("credits") ? Number(formData.get("credits")) : undefined,
        };

        // ✅ Send clean JSON instead of FormData
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
        } else {
            return {
                success: false,
                message: result.message || "Failed to create subject",
                errors: result.errors || {},
            };
        }
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


export async function getSubjects(params: {
    search?: string;
    departmentId?: string | number;
    semesterId?: string | number;
    page?: number;
    limit?: number;
} = {}) {
    try {
        const { search, departmentId, semesterId, page = 1, limit = 10 } = params;

        // Build query string
        const queryParams = new URLSearchParams();

        if (search) queryParams.append("search", search);
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

        // Normalize response (handle different possible structures)
        const subjects = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result)
            ? result
            : [];

        const total = result.total || result.meta?.total || subjects.length;
        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: subjects,
            total,
            totalPages,
            currentPage: page,
            limit,
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