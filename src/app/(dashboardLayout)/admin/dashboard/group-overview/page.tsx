import GroupOverview from "@/components/modules/group/Group-overview";
import { getAllGroups } from "@/service/group/group.service";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; searchTerm?: string; departmentId?: string; shiftId?: string; semesterId?: string };
}) {
  const result = await getAllGroups({
    page: Number(searchParams.page) || 1,
    limit: 6,
    searchTerm: searchParams.searchTerm,
    departmentId: searchParams.departmentId,
    shiftId: searchParams.shiftId,
    semesterId: searchParams.semesterId,
  });
  console.log(result)

  return <GroupOverview initialData={result} />;
}