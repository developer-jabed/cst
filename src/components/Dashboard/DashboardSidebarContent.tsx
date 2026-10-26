"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getIconComponent } from "@/lib/icon-mapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/userInterface";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardSidebarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardSidebarContentProps) => {
  const pathname = usePathname();

  // Safe values
  const displayName = userInfo?.name || "User";
  const profilePhoto = userInfo?.profilePhoto || null;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="hidden md:flex h-screen w-72 flex-col border-r border-gray-100 bg-white shadow-xl">
      {/* BRAND HEADER */}
      <div className="flex h-20 items-center px-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <Link href={dashboardHome} className="flex items-center gap-3.5 group">
          <div className="relative w-11 h-11 shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/dpi-logo.png"
              alt="Dinajpur Polytechnic Institute"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              DPI Progress
            </span>
            <span className="text-[12px] font-medium text-gray-500">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-8">
          {navItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <h4 className="mb-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-[0.5px]">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = getIconComponent(item.icon);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative",
                        isActive
                          ? "bg-violet-50 text-violet-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-600 rounded-r-full" />
                      )}

                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive
                            ? "text-violet-600"
                            : "text-gray-400 group-hover:text-gray-500",
                        )}
                      />

                      <span className="flex-1">{item.title}</span>

                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "ml-auto text-xs font-medium px-2.5 py-0.5",
                            isActive
                              ? "bg-violet-100 text-violet-700"
                              : "bg-gray-100 text-gray-500",
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>

              {sectionIdx < navItems.length - 1 && (
                <Separator className="my-6 bg-gray-100" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* USER PROFILE FOOTER */}
      <div className="border-t border-gray-100 p-5 bg-gray-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-gray-100 shadow-sm">
          {profilePhoto ? (
            <div className="relative h-11 w-11 rounded-2xl overflow-hidden border border-gray-100">
              <Image
                src={profilePhoto}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-lg shadow-inner">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {userInfo.role?.toLowerCase() || "user"}
            </p>
          </div>

          {/* Status indicator */}
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebarContent;