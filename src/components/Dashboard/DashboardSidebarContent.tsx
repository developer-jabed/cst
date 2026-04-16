"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getIconComponent } from "@/lib/icon-mapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/userInterface";
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

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-gray-200 bg-white">

      {/* BRAND */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Link href={dashboardHome} className="flex items-center gap-3">

          {/* simple logo dot */}
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-200 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-900 tracking-wide">
              DPI PROGRESS
            </span>
            <span className="text-[11px] text-gray-500">
              Student Dashboard
            </span>
          </div>

        </Link>
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto px-3 py-4">

        <nav className="space-y-6">

          {navItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>

              {section.title && (
                <h4 className="mb-2 px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
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
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        isActive
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >

                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-indigo-600" : "text-gray-400"
                        )}
                      />

                      <span className="flex-1 truncate">{item.title}</span>

                      {item.badge && (
                        <Badge
                          className={cn(
                            "ml-auto text-[10px] px-2 py-0.5 rounded-md",
                            isActive
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 text-gray-600"
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
                <Separator className="my-4 bg-gray-100" />
              )}

            </div>
          ))}
        </nav>
      </div>

      {/* USER FOOTER */}
      <div className="border-t border-gray-200 p-4 bg-white">

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">

          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userInfo.name}
            </p>
            <p className="text-[11px] text-gray-500 capitalize">
              {userInfo.role.toLowerCase()}
            </p>
          </div>

        </div>
      </div>

    </aside>
  );
};

export default DashboardSidebarContent;