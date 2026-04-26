/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/students/page.tsx
import { getAllDepartments } from "@/service/department/department.service";
import { getAllShifts } from "@/service/shift/shift.service";
import { getAllSemesters } from "@/service/semester/semester.service";
import { getAllGroups } from "@/service/group/group.service";
import { getStudents } from "@/service/student/student.service";
import StudentManagementClient from "@/components/modules/Admin/studentManagement/StudentClient";

export const dynamic = "force-dynamic";

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
        shiftId?: string;
        semesterId?: string;
        groupId?: string;
        gender?: string;
        page?: string;
        limit?: string;
    }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
    // ←←← IMPORTANT: Await searchParams
    const params = await searchParams;

    const page = Number(params.page ?? 1);
    const limit = Number(params.limit ?? 15);

    console.log("📥 [StudentsPage] Raw Search Params (after await):", params);

    const [deptRes, shiftRes, semRes, groupRes, studentsRes] = await Promise.all([
        getAllDepartments({ limit: 200 }),
        getAllShifts({ limit: 200 }),
        getAllSemesters({ limit: 200 }),
        getAllGroups({ limit: 200 }),
        getStudents({
            searchTerm: params.searchTerm,
            departmentId: params.departmentId,
            groupId: params.groupId,
            gender: params.gender,
            page,
            limit,
        }),
    ]);

    console.log("📦 [StudentsPage] Students Result:", {
        total: (studentsRes as any)?.meta?.total,
        dataLength: (studentsRes as any)?.data?.length || 0,
    });

    return (
        <StudentManagementClient
            departments={normalizeList(deptRes)}
            shifts={normalizeList(shiftRes)}
            semesters={normalizeList(semRes)}
            groups={normalizeList(groupRes)}
            students={normalizeList(studentsRes)}
            meta={
                (studentsRes as any)?.meta ?? {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 1,
                }
            }
        />
    );
}