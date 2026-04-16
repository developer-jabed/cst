/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/student/results/page.tsx
import ResultsClient from "@/components/modules/student/result";
import { getResultByRoll } from "@/service/result/result.service";
import { getAllGroups } from "@/service/group/group.service";
import { getAllDepartments } from "@/service/department/department.service";
import { getAllShifts } from "@/service/shift/shift.service";
import { getAllSemesters } from "@/service/semester/semester.service";

interface Props {
  searchParams: Promise<{
    page?: string;
    roll?: string;
    departmentId?: string;
    shiftId?: string;
    semesterId?: string;
    groupId?: string;
  }>;
}

function normalizeList(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;       // ✅ your shape: { data: [...] }
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
}

export default async function ResultsPage({ searchParams }: Props) {
  const p = await searchParams;

  const page         = Math.max(1, Number(p.page) || 1);
  const roll         = (p.roll || "").trim();
  const departmentId = p.departmentId || "";
  const shiftId      = p.shiftId     || "";
  const semesterId   = p.semesterId  || "";
  const groupId      = p.groupId     || "";

  const [singleRes, groupRes, deptRes, shiftRes, semRes] = await Promise.all([
    roll ? getResultByRoll(roll) : null,
    getAllGroups({ page, limit: 10, departmentId, shiftId, semesterId, groupId }),
    getAllDepartments({ limit: 100 }),
    getAllShifts({ limit: 100, departmentId }),
    getAllSemesters({ limit: 100, departmentId, shiftId }),
  ]);

  // ✅ groupRes.data is the array
  const groups      = normalizeList(groupRes);
  const departments = normalizeList(deptRes);
  const shifts      = normalizeList(shiftRes);
  const semesters   = normalizeList(semRes);
  const meta        = groupRes?.meta ?? { page, limit: 10, total: 0 };

  console.log(semRes)

  return (
    <ResultsClient
      key={`${roll}-${page}-${departmentId}-${shiftId}-${semesterId}-${groupId}`}
      initialSingleResult={singleRes?.success ? singleRes.data : null}
      groups={groups}
      groupMeta={meta}
      departments={departments}
      shifts={shifts}
      semesters={semesters}
      page={page}
      roll={roll}
      filters={{ departmentId, shiftId, semesterId, groupId }}
    />
  );
}