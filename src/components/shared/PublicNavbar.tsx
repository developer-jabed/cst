/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";

import LogoutButton from "./LogoutButton";

import { getCookie } from "@/service/auth/tokenHandlers";
import { getUserDashboardRoute } from "@/lib/auth-utils";
import { getUserInfo } from "@/service/auth/getUserInfo";

import { UserInfo } from "@/types/user.interface";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/result", label: "Results" },
  { href: "/book", label: "Books List" },
  { href: "/notice", label: "Notice" },
  { href: "/memory", label: "Memories" },
];

const NAV_CSS = `
@keyframes nav-shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
@keyframes nav-glow {
  0%, 100% { opacity: .45; }
  50% { opacity: 1; }
}
@keyframes nav-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
@keyframes nav-underline {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes nav-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,.35); }
  50% { box-shadow: 0 0 0 6px rgba(5,150,105,0); }
}

.nav-logo-ring {
  animation: nav-float 4s ease-in-out infinite;
}
.nav-logo-ring::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  background: conic-gradient(from 0deg, #059669, #c9a24b, #0d9488, #059669);
  opacity: .55;
  z-index: -1;
  filter: blur(6px);
  animation: nav-glow 5s ease-in-out infinite;
}
.nav-link-active-line {
  transform-origin: left center;
  animation: nav-underline .35s cubic-bezier(.22,1,.36,1) both;
}
.nav-cta-shimmer {
  background-size: 200% auto;
  background-image: linear-gradient(
    110deg,
    #059669 0%,
    #10b981 35%,
    #c9a24b 50%,
    #10b981 65%,
    #0d9488 100%
  );
  animation: nav-shimmer 4.5s linear infinite;
}
.nav-avatar-pulse {
  animation: nav-ring 3s ease-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .nav-logo-ring,
  .nav-logo-ring::after,
  .nav-link-active-line,
  .nav-cta-shimmer,
  .nav-avatar-pulse { animation: none !important; }
}
`;

export default function PublicNavbar() {
  const pathname = usePathname();

  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = userInfo?.name || "User";
  const profilePhoto = userInfo?.profilePhoto || null;

  const initials = useMemo(() => {
    if (!displayName) return "U";
    return displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [displayName]);

  const dashboardHref = useMemo(() => {
    if (!userInfo?.role) return "/dashboard";
    return getUserDashboardRoute(userInfo.role);
  }, [userInfo]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = await getCookie("accessToken");
        if (!token) {
          setLoggedIn(false);
          setUserInfo(null);
          return;
        }

        const result = await getUserInfo();
        let userData: UserInfo | null = null;

        if (result && typeof result === "object") {
          if ("success" in result && result.success) {
            userData = (result as any).data || null;
          } else if ("id" in result) {
            userData = result as UserInfo;
          }
        }

        if (userData?.id) {
          setLoggedIn(true);
          setUserInfo(userData);
        } else {
          setLoggedIn(false);
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setLoggedIn(false);
        setUserInfo(null);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest(".user-dropdown-container")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <style>{NAV_CSS}</style>

      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-[#c9a24b]/25 bg-[#f8f6ef]/90 shadow-[0_8px_32px_-12px_rgba(6,78,59,.18)] backdrop-blur-xl"
            : "border-b border-transparent bg-[#f8f6ef]/55 backdrop-blur-md"
        }`}
      >
        {/* Top gold sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a24b]/70 to-transparent" />

        <div className="mx-auto max-w-screen-2xl px-5 lg:px-10">
          <div className="flex h-[4.5rem] items-center justify-between lg:h-20">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="nav-logo-ring relative h-11 w-11 shrink-0">
                <div className="relative z-10 h-full w-full overflow-hidden rounded-full bg-white/90 p-1.5 shadow-md ring-1 ring-[#c9a24b]/30">
                  <Image
                    src="/dpi-logo.png"
                    alt="Dinajpur Polytechnic Institute"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>
              </div>

              <div className="hidden leading-tight sm:block">
                <h1 className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-lg font-black tracking-tight text-transparent lg:text-xl">
                  Dinajpur Polytechnic
                </h1>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a07d32] lg:text-[10px]">
                  Computer Science & Technology
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-1 rounded-full border border-[#c9a24b]/15 bg-white/50 p-1.5 shadow-sm backdrop-blur-md md:flex">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25"
                        : "text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-800"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="nav-link-active-line absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-[#c9a24b]/80" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {loggedIn && userInfo ? (
                <div className="user-dropdown-container relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="group flex items-center gap-3 rounded-full border border-[#c9a24b]/20 bg-white/70 py-1.5 pl-1.5 pr-3 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-emerald-300/50 hover:shadow-md hover:shadow-emerald-600/10"
                  >
                    {profilePhoto ? (
                      <div className="nav-avatar-pulse relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-emerald-500/30">
                        <Image
                          src={profilePhoto}
                          alt={displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="nav-avatar-pulse flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-sm font-bold text-white shadow-md shadow-emerald-600/30">
                        {initials}
                      </div>
                    )}

                    <div className="hidden text-left lg:block">
                      <p className="text-sm font-bold leading-none text-slate-900">
                        {displayName}
                      </p>
                      <p className="mt-1 text-[11px] font-medium capitalize text-emerald-700/80">
                        {userInfo.role}
                      </p>
                    </div>

                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform duration-300 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-[118%] z-50 w-72 overflow-hidden rounded-2xl border border-[#c9a24b]/20 bg-white/95 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-[#c9a24b] to-teal-500" />
                      <div className="border-b border-slate-100 p-5">
                        <div className="flex items-center gap-3">
                          {profilePhoto ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-emerald-500/25">
                              <Image
                                src={profilePhoto}
                                alt={displayName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-lg font-bold text-white">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {displayName}
                            </p>
                            <p className="truncate text-sm text-slate-500">
                              {userInfo.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href={dashboardHref}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-800"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <LayoutDashboard size={16} />
                          </span>
                          Dashboard
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 p-2">
                        <LogoutButton />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="nav-cta-shimmer hidden items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-transform duration-300 hover:scale-[1.03] active:scale-95 md:inline-flex"
                >
                  <Sparkles size={14} className="opacity-90" />
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c9a24b]/20 bg-white/70 text-slate-700 shadow-sm backdrop-blur-md transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 md:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-[4.5rem] lg:h-20" aria-hidden />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-emerald-950/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />

          <div
            className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-hidden bg-[#f8f6ef] shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-[#c9a24b] to-teal-500" />

            <div className="flex items-center justify-between border-b border-[#c9a24b]/15 p-5">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white p-1 shadow ring-1 ring-[#c9a24b]/25">
                  <Image
                    src="/dpi-logo.png"
                    alt="Dinajpur Polytechnic Institute"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <h2 className="font-bold leading-none text-slate-900">
                    Dinajpur Polytechnic
                  </h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a07d32]">
                    CST Department
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <X size={20} />
              </button>
            </div>

            {loggedIn && userInfo && (
              <div className="border-b border-[#c9a24b]/15 px-5 py-5">
                <div className="flex items-center gap-3">
                  {profilePhoto ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-emerald-500/30">
                      <Image
                        src={profilePhoto}
                        alt={displayName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {displayName}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-2xl px-5 py-3.5 text-base font-semibold transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25"
                          : "text-slate-700 hover:bg-white/80"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {loggedIn && userInfo && (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex items-center gap-3 rounded-2xl border border-[#c9a24b]/20 bg-white/70 px-5 py-3.5 text-base font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="border-t border-[#c9a24b]/15 p-5">
              {loggedIn ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="nav-cta-shimmer flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-lg shadow-emerald-700/25"
                >
                  <Sparkles size={16} />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}