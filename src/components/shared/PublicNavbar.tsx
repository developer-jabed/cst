/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";

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
  { href: "/admission", label: "Admission" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const pathname = usePathname();

  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // =========================
  // DISPLAY VALUES
  // =========================
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

  // =========================
  // DASHBOARD ROUTE
  // =========================
  const dashboardHref = useMemo(() => {
    if (!userInfo?.role) return "/dashboard";
    return getUserDashboardRoute(userInfo.role);
  }, [userInfo]);

  // =========================
  // ACTIVE LINK
  // =========================
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // =========================
  // FETCH USER
  // =========================
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

  // =========================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // =========================
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

  // =========================
  // SCROLL EFFECT
  // =========================
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // =========================
  // LOCK BODY SCROLL
  // =========================
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-5 lg:px-10">
          <div className="h-20 flex items-center justify-between">
            {/* ========================= LOGO ========================= */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-11 h-11 shrink-0">
                <Image
                  src="/dpi-logo.png"
                  alt="Dinajpur Polytechnic Institute"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="hidden sm:block leading-tight">
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                  Dinajpur Polytechnic
                </h1>
                <p className="text-[9px] lg:text-[10px] tracking-[2px] text-gray-500 font-medium uppercase">
                  Computer Science & Technology
                </p>
              </div>
            </Link>

            {/* ========================= DESKTOP NAV ========================= */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-emerald-700"
                      : "text-gray-600 hover:text-emerald-700"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-2 left-0 w-full h-[2px] rounded-full bg-emerald-600" />
                  )}
                </Link>
              ))}
            </div>

            {/* ========================= RIGHT SIDE ========================= */}
            <div className="flex items-center gap-3">
              {/* DESKTOP USER */}
              {loggedIn && userInfo ? (
                <div className="relative hidden md:block user-dropdown-container">
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-full pl-3 pr-4 py-2 hover:bg-gray-100 transition-all duration-300"
                  >
                    {profilePhoto ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={profilePhoto}
                          alt={displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-semibold">
                        {initials}
                      </div>
                    )}

                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900 leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {userInfo.role}
                      </p>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-[120%] w-72 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden z-50">
                      <div className="p-5 border-b">
                        <div className="flex items-center gap-3 mb-3">
                          {profilePhoto ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={profilePhoto}
                                alt={displayName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-semibold text-lg">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {displayName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {userInfo.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href={dashboardHref}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 transition-all"
                        >
                          <LayoutDashboard size={18} />
                          Dashboard
                        </Link>
                      </div>

                      <div className="border-t p-2">
                        <LogoutButton />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-11 h-11 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition-all"
              >
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================= MOBILE MENU ========================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="p-5 border-b shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 shrink-0">
                    <Image
                      src="/dpi-logo.png"
                      alt="Dinajpur Polytechnic Institute"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 leading-none">
                      Dinajpur Polytechnic
                    </h2>
                    <p className="text-[10px] tracking-[2px] uppercase text-gray-500 mt-1">
                      CST Department
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* USER INFO */}
            {loggedIn && userInfo && (
              <div className="px-5 py-5 border-b shrink-0">
                <div className="flex items-center gap-3">
                  {profilePhoto ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={profilePhoto}
                        alt={displayName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-semibold">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* NAV LINKS */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-5 py-4 rounded-2xl text-base font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {loggedIn && userInfo && (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-medium text-gray-700 hover:bg-gray-100 transition-all duration-300"
                  >
                    <LayoutDashboard size={22} />
                    Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-5 border-t shrink-0">
              {loggedIn ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-300"
                >
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