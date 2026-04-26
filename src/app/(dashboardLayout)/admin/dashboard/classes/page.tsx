/* eslint-disable @typescript-eslint/no-explicit-any */


import SubjectsTablePage from "@/components/modules/SubjectManagement/Subject/SubjectTable";
import { getSubjects } from "@/service/auth/subject/subject.service";
import { getAllDepartments } from "@/service/department/department.service";
import { getAllSemesters } from "@/service/semester/semester.service";
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
  }>;
}

export default async function SubjectsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const limit = Number(resolvedSearchParams.limit) || 10;

  // Fetch subjects using the new getSubjects action
  const subjectsResult = await getSubjects({
    search: resolvedSearchParams.search,
    departmentId: resolvedSearchParams.departmentId,
    semesterId: resolvedSearchParams.semesterId,
    page,
    limit,
  });

  // Fetch filter options
  const [departmentsRes, semestersRes] = await Promise.all([
    getAllDepartments(),
    getAllSemesters({}),
  ]);

  const departments = normalizeList(departmentsRes);
  const semesters = normalizeList(semestersRes);

  const subjects = subjectsResult.success ? subjectsResult.data : [];
  const totalPages = subjectsResult.success ? subjectsResult.totalPages : 1;
  const currentPage = subjectsResult.success ? subjectsResult.currentPage : 1;

  console.log(subjects)

  return (
    <div className="p-6 space-y-6">
   
      <SubjectsTablePage
        subjects={subjects}
        departments={departments}
        semesters={semesters}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}