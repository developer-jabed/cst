"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

export async function createSubjectGroup(prevState: any, formData: FormData) {
    try {
        console.log("=== SUBJECT GROUP FORM DATA ===", Object.fromEntries(formData.entries()));

        const backendPayload = {
            teacherId: Number(formData.get("teacherId")),
            subjectId: Number(formData.get("subjectId")),
            groupId: Number(formData.get("groupId")),
            semesterId: Number(formData.get("semesterId")),
            // Add any other fields you need (e.g., isDeleted if required)
        };

        const response = await serverFetch.post("/subject-groups", {
            body: JSON.stringify(backendPayload),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (result.success) {
            revalidateTag("subject-groups-list", "max-age=3600");
            revalidateTag("subject-groups-page-1" , "max-age=3600");
            revalidateTag("admin-dashboard-meta", "max-age=3600");

            return {
                success: true,
                message: "Subject Group created successfully!",
            };
        } else {
            return {
                success: false,
                message: result.message || "Failed to create subject group",
                errors: result.errors || {},
            };
        }
    } catch (error: any) {
        console.error("Create subject group error:", error);

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
 * Get all subject groups with search, filters, and pagination
 */
export async function getSubjectGroups(params: {
    search?: string;
    teacherId?: string | number;
    subjectId?: string | number;
    groupId?: string | number;
    semesterId?: string | number;
    page?: number;
    limit?: number;
} = {}) {
    try {
        const { search, teacherId, subjectId, groupId, semesterId, page = 1, limit = 10 } = params;

        const queryParams = new URLSearchParams();

        if (search) queryParams.append("searchTerm", search);
        if (teacherId) queryParams.append("teacherId", String(teacherId));
        if (subjectId) queryParams.append("subjectId", String(subjectId));
        if (groupId) queryParams.append("groupId", String(groupId));
        if (semesterId) queryParams.append("semesterId", String(semesterId));

        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        const queryString = queryParams.toString();
        const url = `/subject-groups${queryString ? `?${queryString}` : ""}`;

        const response = await serverFetch.get(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch subject groups: ${response.statusText}`);
        }

        const result = await response.json();

        // Normalize response (handles different backend structures)
        const data = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result)
                ? result
                : [];

        const total = result.meta?.total || result.total || data.length;
        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data,
            total,
            totalPages,
            currentPage: page,
            limit,
            meta: result.meta || {},
        };
    } catch (error: any) {
        console.error("Get subject groups error:", error);

        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch subject groups",
            data: [],
            total: 0,
            totalPages: 1,
            currentPage: 1,
        };
    }
}