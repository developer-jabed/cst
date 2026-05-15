/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandlers";
import { UserInfo } from "@/types/userInterface";

export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await serverFetch.get("/auth/me", {
      cache: "force-cache", // Enable caching
      next: {
        revalidate: 1800, // 30 minutes (1800 seconds)
        tags: ["user-info"], // For manual revalidation if needed
      },
    });

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to fetch user info");
    }

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
          id: verifiedToken.id || result.data.id,
          name: verifiedToken.name || result.data.name || "Unknown User",
          email: verifiedToken.email || result.data.email,
          role: verifiedToken.role || result.data.role,
          ...result.data,
        };
      } catch (jwtError) {
        // Fallback if token verification fails
        userInfo = {
          id: result.data.id,
          name:
            result.data.admin?.name ||
            result.data.student?.name ||
            result.data.teacher?.name ||
            result.data.name ||
            "Unknown User",
          email: result.data.email,
          role: result.data.role || "STUDENT",
          ...result.data,
        };
      }
    } else {
      userInfo = {
        id: result.data.id,
        name:
          result.data.admin?.name ||
          result.data.student?.name ||
          result.data.teacher?.name ||
          result.data.name ||
          "Unknown User",
        email: result.data.email,
        role: result.data.role || "STUDENT",
        ...result.data,
      };
    }

    return userInfo;
  } catch (error: any) {
    console.error("getUserInfo Error:", error);

    // Return safe fallback
    return {
      id: "",
      name: "Unknown User",
      email: "",
      role: "STUDENT",
    } as UserInfo;
  }
};
