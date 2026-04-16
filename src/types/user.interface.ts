/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole } from "@/lib/auth-utils";


export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    needPasswordChange: boolean;
    status: "ACTIVE" | "INACTIVE" | "BANNED";
    lastLogin: Date | null;
    admin?: any;
    cr?: any;
    student?: any;
    teacher?: any;
    createdAt: string;
    updatedAt: string;
}