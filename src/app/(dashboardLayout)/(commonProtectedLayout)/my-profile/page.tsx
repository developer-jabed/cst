
import { getUserInfo } from "@/service/auth/getUserInfo";
import ProfileClient from "../../../../components/modules/MyProfile/MyProfile";
export const dynamic = "force-dynamic";
export default async function MyProfilePage() {
  const user = await getUserInfo();


 

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2 text-lg">View and manage your account information</p>
        </div>

        <ProfileClient initialUser={user} />
      </div>
    </div>
  );
}