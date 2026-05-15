"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">DPI</span>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white tracking-tight">
                  Dinajpur Polytechnic
                </div>
                <p className="text-sm text-emerald-500">
                  Computer Science & Technology
                </p>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed max-w-md">
              Excellence in technical education since 1968. Developing skilled
              professionals and innovators for the digital future of Bangladesh.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                <span>Dinajpur, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500" />
                <span>+880 17XX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500" />
                <span>info@cst.dpi.edu.bd</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/programs"
                  className="hover:text-white transition-colors"
                >
                  Programs
                </Link>
              </li>
              <li>
                <Link
                  href="/admission"
                  className="hover:text-white transition-colors"
                >
                  Admission
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-5">Academic</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/faculty"
                  className="hover:text-white transition-colors"
                >
                  Faculty
                </Link>
              </li>
              <li>
                <Link
                  href="/library"
                  className="hover:text-white transition-colors"
                >
                  Library
                </Link>
              </li>
              <li>
                <Link
                  href="/results"
                  className="hover:text-white transition-colors"
                >
                  Results
                </Link>
              </li>
              <li>
                <Link
                  href="/calendar"
                  className="hover:text-white transition-colors"
                >
                  Academic Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold mb-5">Connect With Us</h4>

            <div className="flex gap-4">
              {[
                { name: "Facebook", href: "#" },
                { name: "YouTube", href: "#" },
                { name: "LinkedIn", href: "#" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  className="bg-gray-800 hover:bg-gray-700 transition-colors w-10 h-10 rounded-xl flex items-center justify-center"
                >
                  {social.name[0]}
                </a>
              ))}
            </div>

            <div className="mt-10 text-xs text-gray-500 leading-relaxed">
              Dinajpur Polytechnic Institute
              <br />
              Under the Directorate of Technical Education
              <br />
              Ministry of Education, Bangladesh
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {year} Dinajpur Polytechnic Institute. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-300 transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
