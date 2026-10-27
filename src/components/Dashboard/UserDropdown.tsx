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
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import Link from "next/link";

interface UserDropdownProps {
  userInfo: UserInfo;
}

// Detect client-side mounting without setState-in-effect
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const UserDropdown = ({ userInfo }: UserDropdownProps) => {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const handleLogout = async () => {
    await logoutUser();
  };

  const displayName = userInfo?.name || "User";
  const profilePhoto = userInfo?.profilePhoto || null;
  const roleLabel = userInfo?.role?.toLowerCase() || "user";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Only show the real photo after hydration
  const showPhoto = mounted && profilePhoto;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group flex items-center gap-3 rounded-2xl px-2.5 py-2 transition-all duration-200 hover:bg-emerald-50 active:scale-[0.98] data-[state=open]:bg-emerald-50"
        >
          {/* Avatar */}
          {showPhoto ? (
            <div className="relative h-9 w-9 overflow-hidden rounded-xl shadow-md ring-2 ring-[#c9a24b]/70 transition duration-300 group-hover:scale-105">
              <Image
                src={profilePhoto!}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 font-semibold text-white shadow-md ring-2 ring-[#c9a24b]/70 transition duration-300 group-hover:scale-105">
              {initials}
            </div>
          )}

          {/* User Info */}
          <div className="hidden flex-col items-start md:flex">
            <p className="font-serif text-sm font-semibold tracking-tight text-[#0b1f1a]">
              {displayName}
            </p>
            <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b08a35]">
              {roleLabel}
            </p>
          </div>

          <ChevronDown className="h-4 w-4 text-emerald-700/60 transition-transform duration-300 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 rounded-3xl border border-[#e7e2d3] bg-[#fdfcf8] p-2 shadow-2xl shadow-emerald-950/10"
      >
        {/* Header banner */}
        <DropdownMenuLabel className="p-0">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f1a] via-[#064e3b] to-[#059669] p-4">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />

            <div className="relative flex items-center gap-3.5">
              {showPhoto ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#c9a24b]/80">
                  <Image
                    src={profilePhoto!}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold text-white ring-2 ring-[#c9a24b]/80 backdrop-blur">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base font-semibold text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-emerald-100/80">
                  {userInfo?.email}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-gradient-to-r from-[#e6cf94] to-[#c9a24b] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0b1f1a]">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2 bg-[#e7e2d3]" />

        <div className="space-y-0.5">
          <DropdownMenuItem
            asChild
            className="group cursor-pointer rounded-xl px-3 py-2.5 transition focus:bg-emerald-50 focus:text-emerald-900"
          >
            <Link href="/my-profile" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm transition duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <User className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">View Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="group cursor-pointer rounded-xl px-3 py-2.5 transition focus:bg-amber-50 focus:text-amber-900"
          >
            <Link href="/change-password" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm transition duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <Settings className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">Change Password</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-2 bg-[#e7e2d3]" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="group cursor-pointer rounded-xl px-3 py-2.5 text-rose-600 transition focus:bg-rose-50 focus:text-rose-700"
        >
          <div className="flex w-full items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100 transition duration-300 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;