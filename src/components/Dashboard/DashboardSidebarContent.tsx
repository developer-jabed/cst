"use client";

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

// Soft, distinct icon-chip colours — one per item, cycling
const ACCENTS: string[] = [
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-cyan-500",
  "from-amber-400 to-orange-400",
  "from-lime-400 to-green-500",
  "from-teal-400 to-emerald-600",
];

// Entrance animation (tw-animate-css) with per-item delay applied inline
const ENTER =
  "animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both motion-reduce:animate-none";

const DashboardSidebarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardSidebarContentProps) => {
  const pathname = usePathname();

  // Safe values
  const displayName = userInfo?.name || "User";
  const profilePhoto = userInfo?.profilePhoto || null;
  const roleLabel = userInfo?.role?.toLowerCase() || "user";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Running index across sections (for stagger + colour cycling)
  const offsets = navItems.reduce<number[]>((acc, _s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + navItems[i - 1].items.length);
    return acc;
  }, []);

  return (
    <aside className="relative hidden h-screen w-72 flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#0b1f1a] via-[#08342a] to-[#064e3b] text-white shadow-2xl md:flex">
      {/* ── Decorative background ── */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* ── BRAND HEADER ── */}
      <div className="relative flex h-20 shrink-0 items-center border-b border-white/10 px-5">
        <Link
          href={dashboardHome}
          className={cn("group flex items-center gap-3.5", ENTER)}
        >
          <div className="relative h-11 w-11 shrink-0 rounded-2xl bg-[#f7f5ef] p-1.5 shadow-lg shadow-black/20 ring-1 ring-[#c9a24b]/60 transition duration-300 group-hover:rotate-6 group-hover:scale-105">
            <Image
              src="/dpi-logo.png"
              alt="Dinajpur Polytechnic Institute"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-bold tracking-tight text-white">
              DPI Progress
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e6cf94]">
              {roleLabel} Panel
            </span>
          </div>
        </Link>
      </div>

      {/* ── NAVIGATION ── */}
      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-6 [scrollbar-color:rgba(230,207,148,0.35)_transparent] [scrollbar-width:thin]">
        <nav className="space-y-7">
          {navItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <h4
                  className={cn(
                    "mb-3 flex items-center gap-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9a24b]",
                    ENTER
                  )}
                  style={{ animationDelay: `${offsets[sectionIdx] * 45}ms` }}
                >
                  <span className="h-px w-3 bg-[#c9a24b]/60" />
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const isActive = pathname === item.href;
                  const Icon = getIconComponent(item.icon);
                  const flat = offsets[sectionIdx] + itemIdx;
                  const accent = ACCENTS[flat % ACCENTS.length];

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{ animationDelay: `${flat * 45 + 60}ms` }}
                      className={cn(
                        "group relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                        ENTER,
                        isActive
                          ? "bg-gradient-to-r from-emerald-400/25 to-emerald-400/5 text-white ring-1 ring-emerald-300/30"
                          : "text-white/70 hover:translate-x-1 hover:bg-white/[0.07] hover:text-white"
                      )}
                    >
                      {/* Gold active bar */}
                      {isActive && (
                        <span className="absolute -left-4 bottom-1/4 top-1/4 w-[3px] animate-in zoom-in-50 rounded-r-full bg-gradient-to-b from-[#e6cf94] to-[#c9a24b] duration-500" />
                      )}

                      {/* Colourful icon chip */}
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md shadow-black/20 transition duration-300 group-hover:scale-110 group-hover:-rotate-6",
                          accent,
                          isActive
                            ? "opacity-100 ring-2 ring-white/30"
                            : "opacity-80 group-hover:opacity-100"
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>

                      <span className="flex-1 truncate">{item.title}</span>

                      {item.badge && (
                        <span className="rounded-full bg-gradient-to-r from-[#e6cf94] to-[#c9a24b] px-2.5 py-0.5 text-[10px] font-bold text-[#0b1f1a] shadow">
                          {item.badge}
                        </span>
                      )}

                      {/* Active pulse dot */}
                      {isActive && (
                        <span className="relative mr-1 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70 motion-reduce:animate-none" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {sectionIdx < navItems.length - 1 && (
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* ── USER PROFILE FOOTER ── */}
      <div className="relative shrink-0 border-t border-white/10 p-5">
        <div className="animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-md transition duration-700 fill-mode-both hover:bg-white/[0.09] motion-reduce:animate-none">
          <div className="relative shrink-0">
            {profilePhoto ? (
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl ring-2 ring-[#c9a24b]/70">
                <Image
                  src={profilePhoto}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-lg font-bold text-white shadow-inner ring-2 ring-[#c9a24b]/70">
                {initials}
              </div>
            )}
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b2a21] bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-sm font-semibold text-white">
              {displayName}
            </p>
            <span className="mt-0.5 inline-block rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebarContent;