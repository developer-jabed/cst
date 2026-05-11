/* eslint-disable @typescript-eslint/no-explicit-any */
import SubjectsTablePage from "@/components/modules/SubjectManagement/Subject/SubjectTable";
import { getSubjects } from "@/service/subject/subject.service";
import { getAllDepartments } from "@/service/department/department.service";
import { getAllSemesters } from "@/service/semester/semester.service";
import { getAllGroups } from "@/service/group/group.service";
import { getAllTeachers } from "@/service/admin/teacherManagement";
import { getSubjectGroups } from "@/service/subject/subjectGroup.service";
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
    departmentId?: string;
    semesterId?: string;
    page?: string;
    limit?: string;
    tab?: string;
  }>;
}

export default async function SubjectsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const limit = Number(resolvedSearchParams.limit) || 10;
  const tab = resolvedSearchParams.tab ?? "subjects";

  // Parallel data fetching
  const [
    subjectsResult,
    departmentsRes,
    semestersRes,
    groupsRes,
    teachersRes,
    subjectGroupsResult,
  ] = await Promise.all([
    getSubjects({
      search: resolvedSearchParams.search,
      departmentId: resolvedSearchParams.departmentId,
      semesterId: resolvedSearchParams.semesterId,
      page,
      limit,
    }),
    getAllDepartments(),
    getAllSemesters({}),
    getAllGroups({}),
    getAllTeachers(),
    getSubjectGroups({ page, limit }),
  ]);

  const departments = normalizeList(departmentsRes);
  const semesters = normalizeList(semestersRes);
  const subjects = subjectsResult.success ? subjectsResult.data : [];
  const totalPages = subjectsResult.success ? subjectsResult.totalPages : 1;
  const currentPage = subjectsResult.success ? subjectsResult.currentPage : 1;

  const groups = Array.isArray(groupsRes) ? groupsRes : [];
  const teachers = Array.isArray(teachersRes) ? teachersRes : [];
  const subjectGroups = subjectGroupsResult.success ? subjectGroupsResult.data : [];
  const sgTotalPages = subjectGroupsResult.success ? subjectGroupsResult.totalPages : 1;

  return (
    <div className="p-6 space-y-6">
      {tab === "assignments" ? (
        <SubjectGroupsTablePage
          subjects={subjects}
          groups={groups}
          teachers={teachers}
          semesters={semesters}
          subjectGroups={subjectGroups}
          totalPages={sgTotalPages}
          currentPage={page}
        />
      ) : (
        <SubjectsTablePage
          subjects={subjects}
          departments={departments}
          semesters={semesters}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}