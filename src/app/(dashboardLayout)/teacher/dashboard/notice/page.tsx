import { getNotices } from "@/service/notice/notice.service";
import { getAllGroups } from "@/service/group/group.service";
import { getUserInfo } from "@/service/auth/getUserInfo";
import TeacherNoticesClient from "@/components/modules/notice/teacher/TeacherNoticesClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    page?: string;
    searchTerm?: string;
    priority?: string;
    sortOrder?: "asc" | "desc";
    tab?: "feed" | "mine";
  };
}

export default async function TeacherNoticesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const tab = searchParams.tab || "feed";

  const teacherResult = await getUserInfo();
  const teacher = teacherResult.teacher;

  const sharedParams = {
    searchTerm: searchParams.searchTerm || undefined,
    priority: (searchParams.priority as any) || undefined,
    sortBy: "createdAt",
    sortOrder: searchParams.sortOrder || "desc",
    page,
    limit: 10,
  };

  const [feedResult, myNoticesResult, groupsResult] = await Promise.all([
    getNotices(sharedParams, {
      role: "teacher",
      teacherId: teacher?.id,
      departmentId: teacher?.department?.id,
    }),
    getNotices({
      ...sharedParams,
      teacherId: teacher?.id,
    }),
    getAllGroups({}),
  ]);

  return (
    <TeacherNoticesClient
      feedNotices={feedResult.data || []}
      feedMeta={{
        total: feedResult.total || 0,
        currentPage: feedResult.currentPage || 1,
        totalPages: feedResult.totalPages || 1,
      }}
      myNotices={myNoticesResult.data || []}
      myMeta={{
        total: myNoticesResult.total || 0,
        currentPage: myNoticesResult.currentPage || 1,
        totalPages: myNoticesResult.totalPages || 1,
      }}
      groups={groupsResult.data || []}
      teacher={teacher}
      activeTab={tab}
    />
  );
}
