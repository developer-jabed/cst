import AdminDashboardClient from "@/components/modules/metaData/adminMetadata/adminMetaData";
import { getAdminDashboard } from "@/service/meta/meta.service";

// ✅ Keep it dynamic because it's an authenticated admin page
export const dynamic = "force-dynamic"; // Important: Do NOT use force-static

// Optional: You can still revalidate every 40 minutes (background)
export const revalidate = 2400; // 40 minutes

export default async function AdminDashboardPage() {
  let dashboard = null;

  try {
    const data = await getAdminDashboard();

    // Safe check
    if (
      data &&
      typeof data === "object" &&
      "success" in data &&
      data.success === false
    ) {
      dashboard = null;
    } else {
      dashboard = data;
    }
  } catch (error) {
    console.error("Failed to fetch admin dashboard:", error);
    dashboard = null;
  }

  return <AdminDashboardClient data={dashboard as any} />;
}
