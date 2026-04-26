import { UserRole } from "@/lib/auth-utils";

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    needPasswordChange: boolean;
    isDeleted: boolean;
    profilePhoto?: string; // optional, URL of user profile image
}