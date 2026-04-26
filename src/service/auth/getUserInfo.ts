/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandlers";
import { UserInfo } from "@/types/userInterface";

export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await serverFetch.get("/auth/me", {
      cache: "no-store",           // Better for profile (fresh data)
      next: { tags: ["user-info"] },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error("Invalid user data");
    }

    // Get access token to decode role if needed
    const accessToken = await getCookie("accessToken");
    let decodedRole = null;

    if (accessToken) {
      try {
        const verifiedToken = jwt.verify(
          accessToken,
          process.env.JWT_SECRET as string
        ) as JwtPayload;
        decodedRole = verifiedToken.role;
      } catch (e) {
        console.warn("JWT decode failed in getUserInfo");
      }
    }

    // Merge backend data with decoded token info
    const userData = result.data;

    return {
      id: userData.id || userData.admin?.id || userData.student?.id || userData.teacher?.id || "",
      name: userData.admin?.name || userData.student?.name || userData.teacher?.name || userData.name || "Unknown User",
      email: userData.email || "",
      role: decodedRole || userData.role || "STUDENT",
      needPasswordChange: userData.needPasswordChange || false,
      isDeleted: userData.isDeleted || false,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      // Include nested relations
      admin: userData.admin,
      teacher: userData.teacher,
      student: userData.student,
      ...userData, // spread any extra fields
    };
  } catch (error: any) {
    console.error("getUserInfo error:", error);
    return {
      id: "",
      name: "Unknown User",
      email: "",
      role: "STUDENT" as const,
      needPasswordChange: false,
      isDeleted: false,
    };
  }
};