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
import { UserInfo } from "@/types/user.interface";
import { Menu, GraduationCap, Bell } from "lucide-react";
import { useEffect, useState } from "react";

import DashboardMobileSidebar from "./DashboardMobileSidebar";
import UserDropdown from "./UserDropdown";
import LiveClock from "@/hooks/useClock";

interface DashboardNavbarContentProps {
  userInfo: UserInfo;
  navItems?: NavSection[];
  dashboardHome?: string;
}

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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* LEFT SIDE - Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <Sheet
              open={isMobile && isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
            >
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 p-0">
                <DashboardMobileSidebar
                  userInfo={userInfo}
                  navItems={navItems}
                  dashboardHome={dashboardHome}
                />
              </SheetContent>
            </Sheet>

            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-2xl tracking-tighter text-gray-900">
                    DPI
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 -mt-1">
                    DINAJPUR POLYTECHNIC
                  </p>
                </div>
              </div>

              <div className="hidden md:block pl-6 border-l border-gray-200">
                <p className="text-sm font-semibold text-gray-800">
                  Computer Science & Technology
                </p>
                <p className="text-xs text-gray-500">Academic Portal</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-2xl px-5 py-2 border border-gray-100 shadow-sm">
              <LiveClock />
            </div>

            {/* LIVE Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-2xl border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
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
                  className="relative rounded-xl hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white shadow">
                    2
                  </span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-96 sm:w-[440px]">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>

                <div className="flex-1 py-6 space-y-4 overflow-y-auto">
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                    <p className="font-medium">Assignment Deadline</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Web Development assignment due tomorrow
                    </p>
                    <p className="text-xs text-gray-500 mt-3">2 hours ago</p>
                  </div>

                  <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                    <p className="font-medium">Result Published</p>
                    <p className="text-sm text-gray-600 mt-1">
                      3rd Semester Midterm Result is now available
                    </p>
                    <p className="text-xs text-gray-500 mt-3">Yesterday</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
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
