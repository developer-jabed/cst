/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllGroups } from "@/service/group/group.service";
import { getAllTeachers } from "@/service/admin/teacherManagement";
import { getSubjects } from "@/service/subject/subject.service";
import { getAllSemesters } from "@/service/semester/semester.service";
import { getSubjectGroups } from "@/service/subject/subjectGroup.service";
import SubjectGroupClient from "@/components/modules/SubjectManagement/SubjectGroup/CreateSubjectGroupModal";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

function normalize(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;


  if (res.success === true && Array.isArray(res?.data?.data)) return res.data.data;


  if (res.success === true && Array.isArray(res.data)) return res.data;


  if (Array.isArray(res?.data?.data)) return res.data.data;


  if (Array.isArray(res.data)) return res.data;


  if (Array.isArray(res.result)) return res.result;

  if (Array.isArray(res.items)) return res.items;


  if (Array.isArray(res.rows)) return res.rows;

  return [];
}


function getTotalPages(res: any): number {
  const raw =
    res?.meta?.totalPages       ??
    res?.data?.meta?.totalPages ??
    res?.totalPages             ??  
    res?.meta?.lastPage         ??
    res?.data?.meta?.lastPage   ??
    0;
  return Math.max(1, Number(raw));
}

export default async function SubjectGroupPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;

  const [groupsRes, teachersRes, subjectsRes, semestersRes, sgRes] =
    await Promise.all([
      getAllGroups({}),
      getAllTeachers({}),
      getSubjects({}),
      getAllSemesters({}),
      getSubjectGroups({ page, limit: 10 }),
    ]);

  const groups        = normalize(groupsRes);
  const teachers      = normalize(teachersRes);
  const subjects      = normalize(subjectsRes);
  const semesters     = normalize(semestersRes);
  const subjectGroups = normalize(sgRes);
  const totalPages    = getTotalPages(sgRes);


  console.log(subjectGroups)

  return (
    <SubjectGroupClient
      groups={groups}
      teachers={teachers}
      subjects={subjects}
      semesters={semesters}
      subjectGroups={subjectGroups}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}