/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAllDepartments } from "@/service/department/department.service";
import { getAllSemesters } from "@/service/semester/semester.service";
import { getAllGroups } from "@/service/group/group.service";           // Add this if you have
import { getSubjectGroups } from "@/service/auth/subject/subjectGroup.service";
import { getAllTeachers } from "@/service/admin/teacherManagement";
import SubjectGroupsTablePage from "@/components/modules/SubjectManagement/SubjectGroup/SubjectGroup";

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
    search?: string;
    teacherId?: string;
    subjectId?: string;
    groupId?: string;
    semesterId?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function SubjectGroupsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const limit = Number(resolvedSearchParams.limit) || 10;

  // Fetch subject groups
  const subjectGroupsResult = await getSubjectGroups({
    search: resolvedSearchParams.search,
    teacherId: resolvedSearchParams.teacherId,
    subjectId: resolvedSearchParams.subjectId,
    groupId: resolvedSearchParams.groupId,
    semesterId: resolvedSearchParams.semesterId,
    page,
    limit,
  });

  console.log(subjectGroupsResult)
  // Fetch filter options
  const [departmentsRes, semestersRes, groupsRes, teachersRes] = await Promise.all([
    getAllDepartments(),
    getAllSemesters({}),
    getAllGroups({}),           
    getAllTeachers?.() || [], 
  ]);

  const departments = normalizeList(departmentsRes);
  const semesters = normalizeList(semestersRes);
  const groups = normalizeList(groupsRes);
  const teachers = normalizeList(teachersRes);

  const subjectGroups = subjectGroupsResult.success ? subjectGroupsResult.data : [];
  const totalPages = subjectGroupsResult.success ? subjectGroupsResult.totalPages : 1;
  const currentPage = subjectGroupsResult.success ? subjectGroupsResult.currentPage : 1;

  return (
    <div className="p-6 space-y-6">
      <SubjectGroupsTablePage
        subjectGroups={subjectGroups}
        departments={departments}
        semesters={semesters}
        groups={groups}
        teachers={teachers}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}