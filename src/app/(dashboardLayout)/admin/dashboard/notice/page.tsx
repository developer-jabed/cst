
import { getNotices } from "@/service/notice/notice.service";
import { getAllDepartments } from "@/service/department/department.service";
import { getAllSemesters } from "@/service/semester/semester.service";
import { getAllGroups } from "@/service/group/group.service";
import NoticesPageClient from "@/components/modules/notice/admin/noticeClient";


export const dynamic = "force-dynamic";

interface NoticesPageProps {
  searchParams: {
    page?: string;
    searchTerm?: string;
    audienceType?: string;
    priority?: string;
    sortOrder?: "asc" | "desc";
    departmentId?: string;
    semesterId?: string;
    groupId?: string;
    studentId?: string;
    teacherId?: string;
    isPinned?: string;
    isPublished?: string;
  };
}

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const page = Number(searchParams.page) || 1;

  const [noticesResult, departmentsResult, semestersResult, groupsResult] =
    await Promise.all([
      getNotices({
        page,
        limit: 10,
        searchTerm: searchParams.searchTerm || undefined,
        audienceType: (searchParams.audienceType as any) || undefined,
        priority: (searchParams.priority as any) || undefined,
        sortBy: "createdAt",
        sortOrder: searchParams.sortOrder || "desc",
        departmentId: searchParams.departmentId
          ? Number(searchParams.departmentId)
          : undefined,
        semesterId: searchParams.semesterId
          ? Number(searchParams.semesterId)
          : undefined,
        groupId: searchParams.groupId
          ? Number(searchParams.groupId)
          : undefined,
        studentId: searchParams.studentId
          ? Number(searchParams.studentId)
          : undefined,
        teacherId: searchParams.teacherId
          ? Number(searchParams.teacherId)
          : undefined,
        isPinned:
          searchParams.isPinned !== undefined
            ? searchParams.isPinned === "true"
            : undefined,
        isPublished:
          searchParams.isPublished !== undefined
            ? searchParams.isPublished === "true"
            : undefined,
      }),
      getAllDepartments({}),
      getAllSemesters({}),
      getAllGroups({}),
    ]);

  return (
    <NoticesPageClient
      notices={noticesResult.data || []}
      meta={{
        total: noticesResult.total || 0,
        currentPage: noticesResult.currentPage || 1,
        totalPages: noticesResult.totalPages || 1,
      }}
      departments={departmentsResult.data || []}
      semesters={semestersResult.data || []}
      groups={groupsResult.data || []}
    />
  );
}