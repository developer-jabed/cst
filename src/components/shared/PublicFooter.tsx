"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUp,
  ChevronRight,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
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
    hover: "hover:bg-[#1877F2] hover:shadow-[0_8px_24px_-6px_rgba(24,119,242,0.8)]",
  },
  {
    name: "YouTube",
    href: "#",
    icon: <YouTubeIcon />,
    hover: "hover:bg-[#FF0000] hover:shadow-[0_8px_24px_-6px_rgba(255,0,0,0.7)]",
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: <LinkedInIcon />,
    hover: "hover:bg-[#0A66C2] hover:shadow-[0_8px_24px_-6px_rgba(10,102,194,0.8)]",
  },
];

// ─── Pieces ───────────────────────────────────────────────────────────────────
function ColumnTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-white">{children}</h4>
      <span className="mt-2 block h-1 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
    </div>
  );
}

function FooterLinks({ items }: { items: { label: string; href: string }[] }) {
  return (
    <ul className="space-y-3 text-sm">
      {items.map((l) => (
        <li key={l.href}>
          <Link
            href={l.href}
            className="group inline-flex items-center gap-1.5 text-gray-400 transition-all hover:translate-x-1 hover:text-white"
          >
            <ChevronRight className="h-4 w-4 text-emerald-500 opacity-60 transition-all group-hover:opacity-100" />
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
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 ring-1 ring-emerald-400/20 transition group-hover:from-emerald-500 group-hover:to-cyan-500 group-hover:text-white">
        {icon}
      </span>
      <span className="text-sm text-gray-300 transition group-hover:text-white">
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

// ─── Footer ───────────────────────────────────────────────────────────────────
const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-gray-950 text-gray-300">
      {/* top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500" />

      {/* decorative glow + dot grid */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-screen-2xl px-6 pb-8 pt-16 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* ───────── Brand ───────── */}
          <div className="lg:col-span-5">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 opacity-60 blur-md" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white p-1.5 shadow-xl ring-2 ring-emerald-300/60">
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
                <div className="bg-gradient-to-r from-white via-emerald-100 to-cyan-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  Dinajpur Polytechnic
                </div>
                <p className="text-sm font-medium text-emerald-400">
                  Computer Science &amp; Technology
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <GraduationCap className="h-4 w-4" />
              Shaping technologists since 1968
            </span>

            <p className="mt-5 max-w-md leading-relaxed text-gray-400">
              Excellence in technical education since 1968. Developing skilled
              professionals and innovators for the digital future of
              Bangladesh.
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

          {/* ───────── Quick Links ───────── */}
          <div className="lg:col-span-2">
            <ColumnTitle>Quick Links</ColumnTitle>
            <FooterLinks items={quickLinks} />
          </div>

          {/* ───────── Academic ───────── */}
          <div className="lg:col-span-2">
            <ColumnTitle>Academic</ColumnTitle>
            <FooterLinks items={academicLinks} />
          </div>

          {/* ───────── Connect ───────── */}
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
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-300 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:text-white ${s.hover}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <p className="text-xs leading-relaxed text-gray-400">
                  <span className="font-semibold text-gray-200">
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

        {/* ───────── Bottom bar ───────── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-gray-500 md:flex-row">
          <p>
            © {year}{" "}
            <span className="text-gray-300">Dinajpur Polytechnic Institute</span>
            . All Rights Reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-emerald-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-emerald-400">
              Terms of Use
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-1 hover:shadow-emerald-400/50"
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