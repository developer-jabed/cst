import { getUserInfo } from "@/service/auth/getUserInfo";
import ProfileClient from "../../../../components/modules/MyProfile/MyProfile";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const user = await getUserInfo();

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header – same pattern as Group Overview */}
        <div className="st-fade">
          <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
            Dashboard / Account
          </p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">My Profile</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            View and manage your account information
          </p>
        </div>

        <ProfileClient initialUser={user} />
      </div>
    </div>
  );
}