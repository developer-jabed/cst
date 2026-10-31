"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUp,
  ChevronRight,
  Code2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Programs", href: "/programs" },
  { label: "Admission", href: "/admission" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const academicLinks = [
  { label: "Faculty", href: "/faculty" },
  { label: "Library", href: "/library" },
  { label: "Results", href: "/results" },
  { label: "Academic Calendar", href: "/calendar" },
];

const DEVELOPER = {
  name: "Md Jabed Islam",
  department: "Computer Department",
  phone: "01893292965",
  phoneHref: "tel:+8801893292965",
  email: "jabed1780@gmail.com",
  facebook: "https://www.facebook.com/jabedislam.mukun.73/",
};

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
    <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
    <path d="M23 7.2a3 3 0 00-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 001 7.2 31 31 0 00.5 12 31 31 0 001 16.8a3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1A31 31 0 0023.5 12 31 31 0 0023 7.2zM9.8 15.1V8.9l5.4 3.1-5.4 3.1z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
    <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2zM7.1 20.5H3.6V9h3.5v11.5z" />
  </svg>
);

const socials = [
  {
    name: "Facebook",
    href: "#",
    icon: <FacebookIcon />,
    hover:
      "hover:bg-[#1877F2] hover:shadow-[0_8px_24px_-6px_rgba(24,119,242,0.8)]",
  },
  {
    name: "YouTube",
    href: "#",
    icon: <YouTubeIcon />,
    hover:
      "hover:bg-[#FF0000] hover:shadow-[0_8px_24px_-6px_rgba(255,0,0,0.7)]",
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: <LinkedInIcon />,
    hover:
      "hover:bg-[#0A66C2] hover:shadow-[0_8px_24px_-6px_rgba(10,102,194,0.8)]",
  },
];

const FOOTER_CSS = `
@keyframes ft-sheen {
  from { background-position: 0% center; }
  to { background-position: 200% center; }
}
@keyframes ft-breathe {
  0%, 100% { opacity: .35; transform: scale(1); }
  50% { opacity: .7; transform: scale(1.04); }
}
@keyframes ft-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes ft-line {
  0%, 100% { opacity: .5; width: 2.5rem; }
  50% { opacity: 1; width: 3.25rem; }
}
@keyframes ft-dev-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201,162,75,.0), 0 10px 40px -12px rgba(5,150,105,.35); }
  50% { box-shadow: 0 0 0 4px rgba(201,162,75,.08), 0 10px 40px -12px rgba(201,162,75,.45); }
}
.ft-top-sheen {
  background-size: 200% 100%;
  background-image: linear-gradient(
    90deg,
    #059669 0%,
    #10b981 25%,
    #c9a24b 50%,
    #14b8a6 75%,
    #059669 100%
  );
  animation: ft-sheen 8s linear infinite;
}
.ft-glow-a { animation: ft-breathe 10s ease-in-out infinite; }
.ft-glow-b { animation: ft-breathe 14s ease-in-out infinite reverse; }
.ft-logo { animation: ft-float 5s ease-in-out infinite; }
.ft-title-line { animation: ft-line 3.5s ease-in-out infinite; }
.ft-dev-card { animation: ft-dev-glow 6s ease-in-out infinite; }
.ft-dev-name {
  background-size: 200% auto;
  background-image: linear-gradient(110deg, #ffffff 0%, #e8d5a3 35%, #c9a24b 50%, #e8d5a3 65%, #ffffff 100%);
  animation: ft-sheen 7s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .ft-top-sheen, .ft-glow-a, .ft-glow-b, .ft-logo, .ft-title-line,
  .ft-dev-card, .ft-dev-name {
    animation: none !important;
  }
}
`;

// ─── Pieces ───────────────────────────────────────────────────────────────────
function ColumnTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-base font-bold tracking-wide text-white">
        {children}
      </h4>
      <span className="ft-title-line mt-2 block h-1 rounded-full bg-gradient-to-r from-emerald-400 via-[#c9a24b] to-teal-400" />
    </div>
  );
}

function FooterLinks({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  return (
    <ul className="space-y-3 text-sm">
      {items.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className="group inline-flex items-center gap-1.5 text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-emerald-300"
          >
            <ChevronRight className="h-3.5 w-3.5 text-[#c9a24b] opacity-70 transition-all group-hover:opacity-100" />
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ContactRow({
  icon,
  children,
  href,
}: {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-[#c9a24b]/15 text-emerald-400 ring-1 ring-emerald-400/25 transition-all duration-300 group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25">
        {icon}
      </span>
      <span className="text-sm text-slate-300 transition group-hover:text-white">
        {children}
      </span>
    </>
  );

  const cls = "group flex items-center gap-3";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function DevPill({
  href,
  icon,
  label,
  external,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group inline-flex items-center gap-2 rounded-full border border-[#c9a24b]/25 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c9a24b]/60 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-[#c9a24b]/20 hover:text-white"
    >
      <span className="text-[#c9a24b] transition-colors group-hover:text-emerald-300 [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      {label}
    </a>
  );
}

function DeveloperCredit() {
  const initials = DEVELOPER.name
    .split(" ")
    .filter((p) => p.toLowerCase() !== "md")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="ft-dev-card relative mt-14 overflow-hidden rounded-3xl border border-[#c9a24b]/30 bg-gradient-to-br from-emerald-500/10 via-white/[0.03] to-[#c9a24b]/10 backdrop-blur">
      {/* gold top strip */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-[#c9a24b] to-teal-500" />

      {/* corner glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#c9a24b]/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400 via-[#c9a24b] to-teal-400 opacity-50 blur-md" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-600 text-xl font-black text-white shadow-xl ring-2 ring-[#c9a24b]/60">
              {initials}
            </div>
          </div>

          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a24b]">
              <Code2 className="h-3.5 w-3.5" />
              Designed &amp; Developed by
            </span>
            <p className="ft-dev-name mt-1 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              {DEVELOPER.name}
            </p>
            <p className="mt-0.5 text-sm font-medium text-emerald-300/90">
              {DEVELOPER.department}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 md:max-w-md md:justify-end">
          <DevPill
            href={DEVELOPER.phoneHref}
            icon={<Phone />}
            label={DEVELOPER.phone}
          />
          <DevPill
            href={`mailto:${DEVELOPER.email}`}
            icon={<Mail />}
            label={DEVELOPER.email}
          />
          <DevPill
            href={DEVELOPER.facebook}
            icon={<FacebookIcon />}
            label="Facebook"
            external
          />
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#0a1612] via-[#0c1a15] to-[#07100d] text-slate-300">
      <style>{FOOTER_CSS}</style>

      {/* Animated top accent */}
      <div className="ft-top-sheen h-1.5 w-full" />

      {/* Soft gold hairline under accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c9a24b]/50 to-transparent" />

      {/* Decorative glows */}
      <div className="ft-glow-a pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="ft-glow-b pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#c9a24b]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-0 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #c9a24b 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Linen-like fine lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(201,162,75,.4) 0 1px, transparent 1px 5px)",
        }}
      />

      <div className="relative mx-auto max-w-screen-2xl px-6 pb-8 pt-16 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="mb-6 flex items-center gap-4">
              <div className="ft-logo relative">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-emerald-400 via-[#c9a24b] to-teal-400 opacity-50 blur-md" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white p-1.5 shadow-xl ring-2 ring-[#c9a24b]/40">
                  <Image
                    src="/dpi-logo.png"
                    alt="Dinajpur Polytechnic Institute logo"
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div>
                <div className="bg-gradient-to-r from-white via-emerald-100 to-[#e8d5a3] bg-clip-text text-2xl font-black tracking-tight text-transparent">
                  Dinajpur Polytechnic
                </div>
                <p className="text-sm font-semibold text-emerald-400/90">
                  Computer Science &amp; Technology
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#c9a24b]/30 bg-gradient-to-r from-emerald-500/10 to-[#c9a24b]/10 px-3 py-1 text-xs font-semibold text-[#e8d5a3]">
              <Sparkles className="h-3.5 w-3.5 text-[#c9a24b]" />
              Shaping technologists since 1968
            </span>

            <p className="mt-5 max-w-md leading-relaxed text-slate-400">
              Excellence in technical education since 1968. Developing skilled
              professionals and innovators for the digital future of Bangladesh.
            </p>

            <div className="mt-8 space-y-4">
              <ContactRow
                icon={<MapPin className="h-5 w-5" />}
                href="https://www.google.com/maps/search/?api=1&query=Dinajpur+Polytechnic+Institute"
              >
                Dinajpur, Bangladesh
              </ContactRow>
              <ContactRow icon={<Phone className="h-5 w-5" />}>
                +880 17XX-XXXXXX
              </ContactRow>
              <ContactRow
                icon={<Mail className="h-5 w-5" />}
                href="mailto:info@cst.dpi.edu.bd"
              >
                info@cst.dpi.edu.bd
              </ContactRow>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <ColumnTitle>Quick Links</ColumnTitle>
            <FooterLinks items={quickLinks} />
          </div>

          {/* Academic */}
          <div className="lg:col-span-2">
            <ColumnTitle>Academic</ColumnTitle>
            <FooterLinks items={academicLinks} />
          </div>

          {/* Connect */}
          <div className="lg:col-span-3">
            <ColumnTitle>Connect With Us</ColumnTitle>

            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target={s.href === "#" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-slate-300 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:text-white ${s.hover}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#c9a24b]/15 bg-gradient-to-br from-white/5 to-emerald-500/5 p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <p className="text-xs leading-relaxed text-slate-400">
                  <span className="font-semibold text-slate-200">
                    Dinajpur Polytechnic Institute
                  </span>
                  <br />
                  Under the Directorate of Technical Education
                  <br />
                  Ministry of Education, Bangladesh
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer credit */}
        <DeveloperCredit />

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#c9a24b]/15 pt-8 text-xs text-slate-500 md:flex-row">
          <p>
            © {year}{" "}
            <span className="font-medium text-slate-300">
              Dinajpur Polytechnic Institute
            </span>
            . All Rights Reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-emerald-400"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-emerald-400"
            >
              Terms of Use
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-[#c9a24b] text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-1 hover:shadow-emerald-400/40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;