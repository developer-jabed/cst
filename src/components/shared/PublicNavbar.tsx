/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, LayoutDashboard, User, Menu, X } from "lucide-react";
import { getCookie } from "@/service/auth/tokenHandlers";
import { getUserDashboardRoute } from "@/lib/auth-utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [drop, setDrop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const user = { name: "John Doe", email: "john@cst.edu" };
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  // Dynamic dashboard route based on user role
  const dashboardHref = loggedIn && userRole 
    ? getUserDashboardRoute(userRole as any) 
    : "/dashboard";

  const links = [
    ...NAV_LINKS,
    ...(loggedIn ? [{ href: dashboardHref, label: "Dashboard" }] : [])
  ];

  const isActive = (href: string) =>
    href === "/" 
      ? pathname === "/" 
      : pathname.startsWith(href.replace(/\/$/, ""));

  // Fetch login status + user role from token
  useEffect(() => {
    getCookie("accessToken").then(async (token) => {
      if (!token) {
        setLoggedIn(false);
        setUserRole(null);
        return;
      }

      setLoggedIn(true);

      try {
        // Decode JWT payload to get role (client-side)
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role || null);
      } catch (err) {
        console.error("Failed to decode token for role:", err);
        setUserRole(null);
      }
    });
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDrop(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --ink: #1a1f2e;
          --mid: #5a6080;
          --gold: #b5832a;
          --rule: rgba(26, 31, 46, 0.12);
          --bg: #faf9f6;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          font-family: 'DM Sans', system-ui, sans-serif;
          transition: all 0.3s ease;
        }

        .nav.scrolled {
          background: rgba(250, 249, 246, 0.97);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--rule), 0 4px 25px rgba(26, 31, 46, 0.08);
        }

        .nav-bar {
          height: 2px;
          background: var(--gold);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .nav.scrolled .nav-bar {
          transform: scaleX(1);
        }

        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          height: 64px;
          padding: 0 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--ink);
        }

        .nav-crest {
          width: 36px;
          height: 36px;
          border: 2px solid var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .nav-crest::before {
          content: '';
          position: absolute;
          inset: 5px;
          border: 1px solid var(--gold);
        }

        .nav-crest-txt {
          font-family: 'Playfair Display', serif;
          font-size: 10px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: 1px;
        }

        .nav-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.1;
        }

        .nav-sub {
          font-size: 8px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--mid);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          padding: 8px 18px;
          font-size: 11.8px;
          font-weight: 500;
          letter-spacing: 1.35px;
          text-transform: uppercase;
          color: var(--mid);
          text-decoration: none;
          position: relative;
          white-space: nowrap;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--gold);
          transition: width 0.25s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          color: var(--ink);
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: calc(100% - 28px);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-signin {
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 1.3px;
          text-transform: uppercase;
          color: var(--ink);
          border: 1px solid rgba(26, 31, 46, 0.25);
          padding: 9px 22px;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-signin:hover {
          background: var(--ink);
          color: white;
        }

        .nav-user {
          position: relative;
        }

        .nav-user-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 6px;
          border: 1px solid rgba(26, 31, 46, 0.2);
          border-radius: 6px;
          background: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .nav-user-btn:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        .nav-avatar {
          width: 32px;
          height: 32px;
          background: var(--ink);
          color: white;
          font-size: 11.5px;
          font-weight: 600;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-username {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
        }

        .nav-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 10px;
          width: 230px;
          background: white;
          border: 1px solid var(--rule);
          box-shadow: 0 12px 40px rgba(26, 31, 46, 0.12);
          border-radius: 8px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
          transition: all 0.18s ease;
        }

        .nav-dropdown.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .nav-dropdown-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--rule);
        }

        .nav-dropdown-name {
          font-weight: 500;
          color: var(--ink);
        }

        .nav-dropdown-email {
          font-size: 12px;
          color: var(--mid);
        }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          color: var(--mid);
          text-decoration: none;
          font-size: 14px;
          transition: all 0.15s;
        }

        .nav-dropdown-item:hover {
          background: rgba(26, 31, 46, 0.04);
          color: var(--ink);
        }

        .nav-dropdown-item.red {
          color: #c2410c;
        }

        .nav-dropdown-item.red:hover {
          background: rgba(194, 65, 12, 0.08);
        }

        .nav-mobile-btn {
          display: none;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--rule);
          border-radius: 6px;
          color: var(--ink);
          background: none;
          cursor: pointer;
        }

        /* Mobile Drawer */
        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(10, 12, 20, 0.5);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .overlay.open {
          display: block;
        }

        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background: var(--bg);
          border-left: 1px solid var(--rule);
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
        }

        .drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 64px;
          border-bottom: 1px solid var(--rule);
        }

        .drawer-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--ink);
        }

        .drawer-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--rule);
          border-radius: 6px;
          background: none;
          color: var(--mid);
          cursor: pointer;
        }

        .drawer-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
        }

        .drawer-link {
          padding: 14px 16px;
          font-size: 13.5px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: var(--mid);
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
          transition: all 0.2s;
        }

        .drawer-link:first-child {
          border-top: 1px solid var(--rule);
        }

        .drawer-link:hover,
        .drawer-link.active {
          color: var(--ink);
          padding-left: 24px;
          background: rgba(26, 31, 46, 0.03);
        }

        .drawer-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--rule);
        }

        @media (max-width: 768px) {
          .nav-links,
          .nav-signin,
          .nav-user-btn {
            display: none;
          }
          .nav-mobile-btn {
            display: flex;
          }
          .nav-inner {
            padding: 0 1.25rem;
          }
        }
      `}</style>

      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-bar" />

        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-crest">
              <span className="nav-crest-txt">CST</span>
            </div>
            <div>
              <div className="nav-name">C·S·T Institute</div>
              <div className="nav-sub">Centre for Science & Technology</div>
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="nav-right">
            {loggedIn ? (
              <div className="nav-user" ref={dropRef}>
                <button className="nav-user-btn" onClick={() => setDrop(!drop)}>
                  <div className="nav-avatar">{initials}</div>
                  <span className="nav-username">{user.name}</span>
                  <ChevronDown size={15} className={drop ? "rotate-180" : ""} />
                </button>

                {/* Dropdown */}
                <div className={`nav-dropdown ${drop ? "open" : ""}`}>
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-name">{user.name}</div>
                    <div className="nav-dropdown-email">{user.email}</div>
                  </div>

                  <Link 
                    href={dashboardHref}
                    className="nav-dropdown-item"
                    onClick={() => setDrop(false)}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>

                  <Link 
                    href="/profile" 
                    className="nav-dropdown-item" 
                    onClick={() => setDrop(false)}
                  >
                    <User size={16} /> Profile
                  </Link>

                  <div style={{ height: "1px", background: "var(--rule)", margin: "4px 8px" }} />

                  <button
                    className="nav-dropdown-item red"
                    onClick={() => {
                      setLoggedIn(false);
                      setDrop(false);
                    }}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="nav-signin">
                Sign In
              </Link>
            )}

            <button className="nav-mobile-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`overlay ${mobileOpen ? "open" : ""}`} onClick={closeMobile} />

      <div className={`drawer ${mobileOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title">C·S·T Institute</div>
          <button className="drawer-close" onClick={closeMobile}>
            <X size={18} />
          </button>
        </div>

        <nav className="drawer-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`drawer-link ${isActive(link.href) ? "active" : ""}`}
              onClick={closeMobile}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="drawer-footer">
          {loggedIn ? (
            <button
              onClick={() => {
                setLoggedIn(false);
                closeMobile();
              }}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid var(--rule)",
                background: "none",
                color: "#c2410c",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "1px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="nav-signin"
              onClick={closeMobile}
              style={{ display: "block", textAlign: "center", width: "100%" }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}