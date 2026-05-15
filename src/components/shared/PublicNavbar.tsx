"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";
import { getCookie } from "@/service/auth/tokenHandlers";
import { getUserDashboardRoute } from "@/lib/auth-utils";
import LogoutButton from "./LogoutButton";
import { getUserInfo } from "@/service/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
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

  const dashboardHref = userInfo?.role
    ? getUserDashboardRoute(userInfo.role)
    : "/dashboard";

  const initials = userInfo?.name
    ? userInfo.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // Fetch user info
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = await getCookie("accessToken");
        if (!token) {
          setLoggedIn(false);
          setUserInfo(null);
          return;
        }

        const data = await getUserInfo();
        if (data) {
          setLoggedIn(true);
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setLoggedIn(false);
        setUserInfo(null);
      }
    };

    initializeUser();
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-white/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow">
              <span className="text-white text-2xl font-bold tracking-tighter">
                DPI
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-xl font-semibold text-gray-900">
                Dinajpur Polytechnic
              </div>
              <p className="text-[9px] tracking-[1.5px] text-gray-500 font-medium">
                COMPUTER SCIENCE & TECHNOLOGY
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors hover:text-emerald-700 ${
                  isActive(link.href)
                    ? "text-emerald-700 font-semibold"
                    : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {loggedIn && userInfo ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 pl-4 pr-6 py-2.5 rounded-3xl hover:bg-gray-100 transition-all"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-6 py-5 border-b">
                      <p className="font-semibold text-gray-900">
                        {userInfo.name}
                      </p>
                      <p className="text-sm text-gray-500">{userInfo.email}</p>
                    </div>

                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>

                    <div className="border-t my-1" />
                    <LogoutButton />
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:block px-7 py-2.5 text-sm font-semibold border border-gray-200 rounded-3xl hover:border-emerald-200 hover:text-emerald-700 transition"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-gray-100"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE MENU ==================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-[100] md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white w-[85%] max-w-md h-full ml-auto shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="p-6 flex justify-between items-center border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold">
                  DPI
                </div>
                <div className="font-semibold text-lg">
                  Dinajpur Polytechnic
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X size={28} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-6 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-4 px-6 text-lg font-medium rounded-2xl transition-all ${
                    isActive(link.href)
                      ? "bg-emerald-50 text-emerald-700"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Dashboard Link */}
              {loggedIn && userInfo && (
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-3 py-4 px-6 text-lg font-medium rounded-2xl hover:bg-gray-50 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard size={24} />
                  Dashboard
                </Link>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t mt-auto">
              {loggedIn ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-semibold transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
