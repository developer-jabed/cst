// app/my-profile/page.tsx
import ProfileClient from "@/components/modules/MyProfile/MyProfile";
import { getUserInfo } from "@/service/auth/getUserInfo";

import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const user = await getUserInfo();

  // Optional: Redirect if not logged in (middleware should already handle this)
  if (!user.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <ProfileClient initialUser={user} />
      </div>
    </div>
  );
}