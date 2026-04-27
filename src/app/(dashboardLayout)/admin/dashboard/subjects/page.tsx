import GroupOverview from "@/components/modules/group/Group-overview";
import { getAllGroups } from "@/service/group/group.service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const result = await getAllGroups({});

  const normalizedData = {
    success: result?.success ?? false,
    data: result?.data ?? [],
  };



  return <GroupOverview initialData={normalizedData} />;
}