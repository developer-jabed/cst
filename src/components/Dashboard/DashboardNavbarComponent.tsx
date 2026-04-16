"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/user.interface";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import DashboardMobileSidebar from "./DashboardMobileSidebar";
import NotificationDropdown from "./Notification";
import UserDropdown from "./UserDropdown";
import LiveClock from "@/hooks/useClock";


interface DashboardNavbarContentProps {
  userInfo: UserInfo;
  navItems?: NavSection[];
  dashboardHome?: string;
}

const DashboardNavbarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardNavbarContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 rounded-full m-4 bg-gray-100 backdrop-blur-xl shadow-sm">

      <div className="flex h-20 items-center justify-between px-5 md:px-8">

        {/* MOBILE MENU */}
        <Sheet open={isMobile && isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0">
            <DashboardMobileSidebar
              userInfo={userInfo}
              navItems={navItems || []}
              dashboardHome={dashboardHome || ""}
            />
          </SheetContent>
        </Sheet>

        {/* 🏫 BRAND */}
        <div className="hidden md:flex flex-col leading-tight">
          <span className="text-sm font-bold text-gray-900">
            Dinajpur Polytechnic Institute
          </span>

          <span className="mt-1 w-fit rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
            Computer Science & Engineering
          </span>
        </div>

        {/* ⏰ CLOCK (ISOLATED COMPONENT = SAFE) */}
        <div className="hidden md:block">
          <LiveClock />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
            <NotificationDropdown />
            <UserDropdown userInfo={userInfo} />
          </div>

        </div>

      </div>
    </header>
  );
};

export default DashboardNavbarContent;