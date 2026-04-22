/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/admin/teachers/page.tsx
import { getAllDepartments } from "@/service/department/department.service";
import { getAllTeachers } from "@/service/admin/teacherManagement";
import TeacherManagementClient from "@/components/modules/Admin/teacherManagement/teacherClient";

function normalizeList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
}

interface PageProps {
    searchParams: Promise<{
        searchTerm?: string;
        departmentId?: string;
        designation?: string;
        page?: string;
        limit?: string;
    }>;
}

export default async function TeachersPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const page = Number(params.page ?? 1);
    const limit = Number(params.limit ?? 15);

    console.log("📥 [TeachersPage] Raw Search Params:", params);

    const [deptRes, teachersRes] = await Promise.all([
        getAllDepartments({ limit: 200 }),
        getAllTeachers({
            searchTerm: params.searchTerm,
            departmentId: params.departmentId,
            designation: params.designation,
            page,
            limit,
        }),
    ]);

    

    return (
        <TeacherManagementClient
            departments={normalizeList(deptRes)}
            teachers={normalizeList(teachersRes)}
            meta={
                (teachersRes as any)?.meta ?? {
                    page: 1,
                    limit: 15,
                    total: 0,
                    totalPages: 1,
                }
            }
        />
    );
}