import AdminDashboardClient from "@/components/modules/metaData/adminMetadata/adminMetaData";
import { getAdminDashboard } from "@/service/meta/meta.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetched on the server — zero client waterfall
  const data = await getAdminDashboard();

  const dashboard = "success" in data && data.success === false ? null : data;
  console.log(dashboard)

  return <AdminDashboardClient data={dashboard as any} />;
}
