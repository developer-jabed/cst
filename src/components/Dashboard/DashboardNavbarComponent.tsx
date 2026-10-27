"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/userInterface"; // ← use the same type file
import { Menu, Bell, ClipboardList, Trophy } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import DashboardMobileSidebar from "./DashboardMobileSidebar";
import UserDropdown from "./UserDropdown";
import LiveClock from "@/hooks/useClock";

interface DashboardNavbarContentProps {
  userInfo: UserInfo;
  navItems?: NavSection[];
  dashboardHome?: string;
}

// Entrance animation (tw-animate-css)
const ENTER =
  "animate-in fade-in slide-in-from-top-2 duration-500 fill-mode-both motion-reduce:animate-none";

const DashboardNavbarContent = ({
  userInfo,
  navItems = [],
  dashboardHome = "/",
}: DashboardNavbarContentProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7e2d3] bg-[#fdfcf8]/85 backdrop-blur-xl">
      {/* Thin gold glow line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a24b]/60 to-transparent" />

      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* LEFT SIDE - Mobile Menu + Logo */}
          <div className={`flex items-center gap-4 ${ENTER}`}>
            <Sheet
              open={isMobile && isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
            >
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-emerald-900 transition hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-72 border-r-0 bg-[#0b1f1a] p-0 [&>button]:text-white"
              >
                <DashboardMobileSidebar
                  userInfo={userInfo}
                  navItems={navItems}
                  dashboardHome={dashboardHome}
                />
              </SheetContent>
            </Sheet>

            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="group flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#c9a24b]/50 transition duration-300 group-hover:rotate-6 group-hover:scale-105 group-hover:shadow-md">
                  <Image
                    src="/dpi-logo.png"
                    alt="Dinajpur Polytechnic Institute"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>

                <div className="leading-tight">
                  <div className="font-serif text-xl font-bold tracking-tight text-[#0b1f1a]">
                    DPI Progress
                  </div>
                  <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b08a35]">
                    Dinajpur Polytechnic
                  </p>
                </div>
              </div>

              <div className="hidden border-l border-[#e7e2d3] pl-6 md:block">
                <p className="font-serif text-sm font-semibold text-[#0b1f1a]">
                  Computer Science & Technology
                </p>
                <p className="text-xs text-gray-500">Academic Portal</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className={`flex items-center gap-3 md:gap-4 ${ENTER}`}>
            {/* Live Clock */}
            <div className="hidden items-center rounded-full border border-[#e6cf94] bg-gradient-to-b from-emerald-50 to-white px-5 py-2 text-emerald-900 shadow-sm md:flex [&_*]:tabular-nums">
              <LiveClock />
            </div>

            {/* LIVE Indicator */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold tracking-wider text-emerald-800 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              LIVE
            </div>

            {/* Notification Sheet */}
            <Sheet
              open={isNotificationOpen}
              onOpenChange={setIsNotificationOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="group relative rounded-xl text-emerald-900 transition hover:bg-emerald-50 active:scale-95"
                >
                  <Bell className="h-5 w-5 origin-top transition duration-300 group-hover:rotate-12" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60 motion-reduce:animate-none" />
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white shadow ring-2 ring-[#e6cf94]">
                      2
                    </span>
                  </span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-96 border-l border-[#e7e2d3] bg-[#f7f5ef] sm:w-[440px]"
              >
                <SheetHeader className="border-b border-[#e7e2d3] pb-4">
                  <SheetTitle className="font-serif text-xl text-[#0b1f1a]">
                    Notifications
                  </SheetTitle>
                  <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-[#c9a24b] to-transparent" />
                </SheetHeader>

                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-6">
                  <div
                    className="group animate-in fade-in slide-in-from-right-4 flex gap-3 rounded-2xl border border-[#e7e2d3] bg-white p-4 shadow-sm transition duration-300 fill-mode-both hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md motion-reduce:animate-none"
                    style={{ animationDelay: "80ms" }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md shadow-amber-200 transition group-hover:scale-110 group-hover:-rotate-6">
                      <ClipboardList className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0b1f1a]">
                        Assignment Deadline
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Web Development assignment due tomorrow
                      </p>
                      <p className="mt-3 text-xs text-gray-400">2 hours ago</p>
                    </div>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  </div>

                  <div
                    className="group animate-in fade-in slide-in-from-right-4 flex gap-3 rounded-2xl border border-[#e7e2d3] bg-white p-4 shadow-sm transition duration-300 fill-mode-both hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md motion-reduce:animate-none"
                    style={{ animationDelay: "180ms" }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-200 transition group-hover:scale-110 group-hover:-rotate-6">
                      <Trophy className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0b1f1a]">
                        Result Published
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        3rd Semester Midterm Result is now available
                      </p>
                      <p className="mt-3 text-xs text-gray-400">Yesterday</p>
                    </div>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  </div>
                </div>

                <div className="border-t border-[#e7e2d3] p-4 pt-4">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-[#e6cf94] bg-white font-semibold text-emerald-900 transition hover:bg-emerald-50 hover:text-emerald-800 active:scale-[0.98]"
                  >
                    Mark all as read
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Dropdown */}
            <UserDropdown userInfo={userInfo} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbarContent;