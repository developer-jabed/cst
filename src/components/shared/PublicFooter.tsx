"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";

const QUICK_LINKS = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/programs", label: "Programs" },
    { href: "/admissions", label: "Admissions" },
    { href: "/research", label: "Research" },
    { href: "/contact", label: "Contact" },
];

const ACADEMIC = [
    { href: "/departments", label: "Departments" },
    { href: "/faculty", label: "Faculty & Staff" },
    { href: "/library", label: "Library" },
    { href: "/calendar", label: "Academic Calendar" },
    { href: "/results", label: "Results" },
    { href: "/dashboard", label: "Student Portal" },
];

const LEGAL = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/accessibility", label: "Accessibility" },
];

const PublicFooter = () => {
    const year = new Date().getFullYear();

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --ft-bg:        #12151f;
          --ft-bg-card:   #1a1e2b;
          --ft-rule:      rgba(255,255,255,0.07);
          --ft-rule-gold: rgba(200,150,44,0.35);
          --ft-gold:      #c8962c;
          --ft-gold-dim:  rgba(200, 150, 44, 0.15);
          --ft-white:     #f5f4f1;
          --ft-muted:     rgba(245,244,241,0.45);
          --ft-faint:     rgba(245,244,241,0.22);
        }

        .cstf {
          background: var(--ft-bg);
          font-family: 'DM Sans', sans-serif;
          color: var(--ft-white);
          position: relative;
          overflow: hidden;
        }

        /* Decorative corner marks */
        .cstf::before,
        .cstf::after {
          content: '';
          position: absolute;
          width: 180px;
          height: 180px;
          border: 1px solid var(--ft-rule);
          pointer-events: none;
        }
        .cstf::before {
          top: -1px;
          right: -1px;
          border-top-color: transparent;
          border-right-color: transparent;
          border-bottom-color: var(--ft-rule-gold);
          border-left-color: var(--ft-rule-gold);
        }
        .cstf::after {
          bottom: 60px;
          left: -1px;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-top-color: var(--ft-rule);
          border-right-color: var(--ft-rule);
        }

        /* Gold top border */
        .cstf-topbar {
          height: 3px;
          background: linear-gradient(90deg, var(--ft-gold) 0%, rgba(200,150,44,0.2) 60%, transparent 100%);
          width: 100%;
        }

        .cstf-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem 3rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.4fr;
          gap: 3rem;
        }

        /* ── BRAND COLUMN ── */
        .cstf-brand {}

        .cstf-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          margin-bottom: 1.75rem;
        }
        .cstf-crest {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1.5px solid rgba(245,244,241,0.3);
          position: relative;
          flex-shrink: 0;
        }
        .cstf-crest::before {
          content: '';
          position: absolute;
          inset: 5px;
          border: 1px solid var(--ft-gold);
        }
        .cstf-crest-letters {
          font-family: 'Playfair Display', serif;
          font-size: 10px;
          font-weight: 600;
          color: var(--ft-white);
          letter-spacing: 1.5px;
          line-height: 1;
          position: relative;
          z-index: 1;
        }
        .cstf-wordmark { display: flex; flex-direction: column; gap: 3px; }
        .cstf-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--ft-white);
          line-height: 1;
          letter-spacing: 0.3px;
        }
        .cstf-sub {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--ft-muted);
          line-height: 1;
        }

        .cstf-tagline {
          font-size: 13px;
          font-weight: 300;
          color: var(--ft-muted);
          line-height: 1.75;
          max-width: 280px;
          margin-bottom: 2rem;
          font-style: italic;
          letter-spacing: 0.2px;
        }

        /* Contact info */
        .cstf-contacts { display: flex; flex-direction: column; gap: 11px; }
        .cstf-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12.5px;
          color: var(--ft-muted);
          line-height: 1.5;
          letter-spacing: 0.1px;
        }
        .cstf-contact-item svg {
          color: var(--ft-gold);
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── LINK COLUMNS ── */
        .cstf-col-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--ft-gold);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cstf-col-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--ft-rule-gold);
        }

        .cstf-links { display: flex; flex-direction: column; gap: 0; }
        .cstf-link {
          font-size: 13px;
          font-weight: 400;
          color: var(--ft-muted);
          text-decoration: none;
          padding: 7px 0;
          border-bottom: 1px solid var(--ft-rule);
          display: flex;
          align-items: center;
          justify-content: space-between;
          letter-spacing: 0.2px;
          transition: color 0.18s, padding-left 0.2s;
        }
        .cstf-link:hover {
          color: var(--ft-white);
          padding-left: 6px;
        }
        .cstf-link:last-child { border-bottom: none; }
        .cstf-link-arrow {
          width: 0;
          height: 1px;
          background: var(--ft-gold);
          transition: width 0.2s cubic-bezier(.22,1,.36,1);
          flex-shrink: 0;
        }
        .cstf-link:hover .cstf-link-arrow { width: 12px; }

        /* ── ACCREDITATION COLUMN ── */
        .cstf-accred {}
        .cstf-badge {
          border: 1px solid var(--ft-rule);
          padding: 14px 16px;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.2s;
        }
        .cstf-badge:hover { border-color: var(--ft-rule-gold); }
        .cstf-badge-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--ft-gold);
        }
        .cstf-badge-value {
          font-size: 12.5px;
          font-weight: 400;
          color: var(--ft-muted);
          letter-spacing: 0.2px;
        }

        /* Social row */
        .cstf-social-row {
          display: flex;
          gap: 8px;
          margin-top: 1.5rem;
        }
        .cstf-social {
          width: 34px;
          height: 34px;
          border: 1px solid var(--ft-rule);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: var(--ft-muted);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.18s;
        }
        .cstf-social:hover {
          background: var(--ft-gold-dim);
          border-color: var(--ft-rule-gold);
          color: var(--ft-gold);
        }

        /* ── BOTTOM BAR ── */
        .cstf-bottom {
          border-top: 1px solid var(--ft-rule);
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.25rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .cstf-copy {
          font-size: 11.5px;
          color: var(--ft-faint);
          letter-spacing: 0.2px;
          line-height: 1.5;
        }
        .cstf-copy strong {
          color: var(--ft-muted);
          font-weight: 500;
        }
        .cstf-legal {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .cstf-legal-link {
          font-size: 11px;
          color: var(--ft-faint);
          text-decoration: none;
          letter-spacing: 0.5px;
          padding: 0 12px;
          border-right: 1px solid var(--ft-rule);
          transition: color 0.15s;
        }
        .cstf-legal-link:last-child { border-right: none; padding-right: 0; }
        .cstf-legal-link:first-child { padding-left: 0; }
        .cstf-legal-link:hover { color: var(--ft-muted); }

        @media (max-width: 960px) {
          .cstf-main {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
          .cstf-brand { grid-column: 1 / -1; }
          .cstf-tagline { max-width: 100%; }
        }

        @media (max-width: 560px) {
          .cstf-main { grid-template-columns: 1fr; gap: 2rem; }
          .cstf-bottom { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .cstf-legal { flex-wrap: wrap; gap: 4px; }
          .cstf-legal-link { border-right: none; padding: 0 8px 0 0; }
        }
      `}</style>

            <footer className="cstf">
                <div className="cstf-topbar" />

                <div className="cstf-main">

                    {/* Brand column */}
                    <div className="cstf-brand">
                        <Link href="/" className="cstf-logo">
                            <div className="cstf-crest">
                                <span className="cstf-crest-letters">CST</span>
                            </div>
                            <div className="cstf-wordmark">
                                <div className="cstf-name">C·S·T Institute</div>
                                <div className="cstf-sub">Centre for Science &amp; Technology</div>
                            </div>
                        </Link>

                        <p className="cstf-tagline">
                            Advancing knowledge through rigorous inquiry, principled scholarship, and a commitment to the progress of science and technology.
                        </p>

                        <div className="cstf-contacts">
                            <div className="cstf-contact-item">
                                <MapPin size={13} />
                                <span>123 Academic Avenue, Dhaka 1200, Bangladesh</span>
                            </div>
                            <div className="cstf-contact-item">
                                <Phone size={13} />
                                <span>+880 2-9999-0000</span>
                            </div>
                            <div className="cstf-contact-item">
                                <Mail size={13} />
                                <span>enquiries@cst.edu.bd</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <div className="cstf-col-title">Navigate</div>
                        <nav className="cstf-links">
                            {QUICK_LINKS.map((item) => (
                                <Link key={item.href} href={item.href} className="cstf-link">
                                    {item.label}
                                    <span className="cstf-link-arrow" />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Academic */}
                    <div>
                        <div className="cstf-col-title">Academic</div>
                        <nav className="cstf-links">
                            {ACADEMIC.map((item) => (
                                <Link key={item.href} href={item.href} className="cstf-link">
                                    {item.label}
                                    <span className="cstf-link-arrow" />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Accreditation & Social */}
                    <div className="cstf-accred">
                        <div className="cstf-col-title">Recognition</div>

                        <div className="cstf-badge">
                            <span className="cstf-badge-label">Established</span>
                            <span className="cstf-badge-value">1998 · Dhaka, Bangladesh</span>
                        </div>
                        <div className="cstf-badge">
                            <span className="cstf-badge-label">Accreditation</span>
                            <span className="cstf-badge-value">University Grants Commission</span>
                        </div>
                        <div className="cstf-badge">
                            <span className="cstf-badge-label">Affiliation</span>
                            <span className="cstf-badge-value">National University, Bangladesh</span>
                        </div>

                        <div className="cstf-social-row">
                            {[
                                { label: "Fb", href: "#" },
                                { label: "Li", href: "#" },
                                { label: "Yt", href: "#" },
                                { label: "Tw", href: "#" },
                            ].map((s) => (
                                <a key={s.label} href={s.href} className="cstf-social" aria-label={s.label}>
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="cstf-bottom">
                    <p className="cstf-copy">
                        &copy; {year} <strong>C·S·T Institute</strong>. All rights reserved. Dhaka, Bangladesh.
                    </p>
                    <nav className="cstf-legal">
                        {LEGAL.map((item) => (
                            <Link key={item.href} href={item.href} className="cstf-legal-link">
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </footer>
        </>
    );
};

export default PublicFooter;