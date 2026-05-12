
import NoticesPageClient from "@/components/modules/notice/admin/noticeClient";
import { getNotices } from "@/service/notice/notice.service";

export const dynamic = "force-dynamic";

interface NoticesPageProps {
  searchParams: {
    page?: string;
    searchTerm?: string;
    audienceType?: string;
    priority?: string;
    sortOrder?: "asc" | "desc";
  };
}

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const page = Number(searchParams.page) || 1;

  const result = await getNotices({
    page,
    limit: 10,
    searchTerm: searchParams.searchTerm || undefined,
    audienceType: (searchParams.audienceType as any) || undefined,
    priority: (searchParams.priority as any) || undefined,
    sortBy: "createdAt",
    sortOrder: searchParams.sortOrder || "desc",
  });

  return (
    <NoticesPageClient
      notices={result.data || []}
      meta={{
        total: result.total || 0,
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 1,
      }}
    />
  );
}
