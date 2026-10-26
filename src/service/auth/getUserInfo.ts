/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandlers";
import { UserInfo } from "@/types/userInterface";

export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await serverFetch.get("/auth/me", {
      cache: "force-cache",
      next: {
        revalidate: 1800,
        tags: ["user-info"],
      },
    });

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to fetch user info");
    }

    const data = result.data;

    // Prefer nested values
    const properName =
      data.student?.name ||
      data.teacher?.name ||
      data.admin?.name ||
      data.name ||
      "Unknown User";

    const profilePhoto =
      data.student?.profilePhoto ||
      data.teacher?.profilePhoto ||
      data.admin?.profilePhoto ||
      data.profilePhoto ||
      null;

    // Get token for additional verification
    const accessToken = await getCookie("accessToken");

    let userInfo: UserInfo;

    if (accessToken) {
      try {
        const verifiedToken = jwt.verify(
          accessToken,
          process.env.JWT_SECRET as string,
        ) as JwtPayload;

        userInfo = {
          id: verifiedToken.id || data.id,
          name: properName,
          email: verifiedToken.email || data.email,
          role: verifiedToken.role || data.role,
          profilePhoto, // ← added
          ...data, // keep nested student / teacher / admin
        };
      } catch (jwtError) {
        userInfo = {
          id: data.id,
          name: properName,
          email: data.email,
          role: data.role || "STUDENT",
          profilePhoto,
          ...data,
        };
      }
    } else {
      userInfo = {
        id: data.id,
        name: properName,
        email: data.email,
        role: data.role || "STUDENT",
        profilePhoto,
        ...data,
      };
    }

    return userInfo;
  } catch (error: any) {
    console.error("getUserInfo Error:", error);

    return {
      id: "",
      name: "Unknown User",
      email: "",
      role: "STUDENT",
      profilePhoto: null,
    } as UserInfo;
  }
};