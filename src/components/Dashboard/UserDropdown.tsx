"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/service/auth/logoutUser";
import { UserInfo } from "@/types/userInterface";

import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import LogoutButton from "../shared/LogoutButton";

interface UserDropdownProps {
  userInfo: UserInfo;
}

const UserDropdown = ({ userInfo }: UserDropdownProps) => {
  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>

          {/* User Info (Hidden on small screens) */}
          <div className="hidden md:flex flex-col items-start">
            <p className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
              {userInfo.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 capitalize">
              {userInfo.role}
            </p>
          </div>

          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 p-2 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
      >
        {/* User Header */}
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold shadow-inner">
              {userInfo.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {userInfo.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {userInfo.email}
              </p>
              <p className="text-xs font-medium text-violet-600 dark:text-violet-400 capitalize mt-0.5">
                {userInfo.role}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem
            asChild
            className="rounded-2xl py-3 px-4 cursor-pointer"
          >
            <Link href="/my-profile" className="flex items-center gap-3">
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="rounded-2xl py-3 px-4 cursor-pointer"
          >
            <Link href="/change-password" className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              <span>Change Password</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-1" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-2xl py-3 px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer focus:bg-red-50"
        >
          <div className="flex items-center gap-3 w-full">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
