import Link from "next/link";
import Image from "next/image";

export const revalidate = 1800;

export default function HomePage() {
  return (
    <main className="min-h-screen font-sans bg-white text-gray-900">
      {/* ===================== HERO ===================== */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-br from-[#f8faf9] via-white to-[#f0fdf4]">
        {/* subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="pt-24 lg:pt-0">
              <div className="inline-flex items-center gap-2.5 mb-8 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border border-emerald-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 text-xs font-semibold tracking-[2.5px] uppercase">
                  Est. 1964 • Balubari, Dinajpur
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight">
                Department of{" "}
                <span className="text-emerald-600">
                  Computer Science &amp; Technology
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
                Dinajpur Polytechnic Institute — one of the oldest and most
                reputed government polytechnics in Bangladesh. Building skilled
                technologists and industry-ready professionals since 1964.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold text-base transition-all shadow-lg shadow-emerald-200/60 hover:shadow-emerald-300/70"
                >
                  Apply for Admission
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center border border-gray-300 hover:border-emerald-500 hover:text-emerald-700 px-8 py-4 rounded-2xl font-medium transition-all bg-white/60"
                >
                  View Programs
                </Link>
              </div>

              {/* Quick Stats under CTA */}
              <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 text-sm">
                <div>
                  <div className="text-2xl font-bold text-gray-900">4500+</div>
                  <div className="text-gray-500">Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">6</div>
                  <div className="text-gray-500">Technologies</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">60+</div>
                  <div className="text-gray-500">Years of Excellence</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-100/50 p-8 border border-emerald-50">
                  <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl flex items-center justify-center p-10">
                    <div className="relative w-48 h-48">
                      <Image
                        src="/dpi-logo.png"
                        alt="Dinajpur Polytechnic Institute"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      Dinajpur Polytechnic Institute
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Government Polytechnic • BTEB
                    </p>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-5 -right-5 bg-white px-6 py-4 rounded-2xl shadow-xl border border-emerald-100">
                  <div className="text-emerald-600 text-3xl font-bold">
                    1100+
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    New Students / Year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS BAR ===================== */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "4500+", label: "Current Students" },
              { number: "60+", label: "Years of Excellence" },
              { number: "100+", label: "Faculty Members" },
              { number: "6", label: "Engineering Technologies" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-500 mt-2 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PROGRAMS / TECHNOLOGIES ===================== */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/dpi-logo.png"
                    alt="DPI Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase">
                  Academic Programs
                </p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Technologies
              </h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Four-year Diploma in Engineering programs under the Bangladesh
                Technical Education Board (BTEB). Each department is equipped with
                modern laboratories and industry-aligned curriculum.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium group"
            >
              View all programs
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Technology Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              {
                name: "Computer Science & Technology",
                short: "CST",
                seats: "200",
                duration: "4 Years",
                description:
                  "Programming, database systems, networking, web development, software engineering and emerging technologies.",
                highlights: ["Programming", "Networking", "Web & Software", "Database"],
              },
              {
                name: "Electrical Technology",
                short: "ET",
                seats: "200",
                duration: "4 Years",
                description:
                  "Power systems, electrical machines, electronics, industrial control and renewable energy applications.",
                highlights: ["Power Systems", "Machines", "Electronics", "Control"],
              },
              {
                name: "Civil Technology",
                short: "CT",
                seats: "200",
                duration: "4 Years",
                description:
                  "Structural design, surveying, construction management, transportation and environmental engineering.",
                highlights: ["Structure", "Surveying", "Construction", "Environment"],
              },
              {
                name: "Mechanical Technology",
                short: "MT",
                seats: "200",
                duration: "4 Years",
                description:
                  "Machine design, manufacturing processes, thermodynamics, fluid mechanics and industrial automation.",
                highlights: ["Manufacturing", "Design", "Thermodynamics", "Automation"],
              },
              {
                name: "Power Technology",
                short: "PT",
                seats: "200",
                duration: "4 Years",
                description:
                  "Thermal power, diesel & gas engines, power plant operation, maintenance and energy management.",
                highlights: ["Power Plant", "Engines", "Maintenance", "Energy"],
              },
              {
                name: "Architecture & Interior Design",
                short: "AIDT",
                seats: "100",
                duration: "4 Years",
                description:
                  "Architectural drafting, building design, interior planning, 3D modeling and construction drawing.",
                highlights: ["Drafting", "Design", "3D Modeling", "Interior"],
              },
            ].map((prog) => (
              <div
                key={prog.name}
                className="group relative bg-white border border-gray-100 hover:border-emerald-200 rounded-3xl p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                {/* Decorative top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100">
                      <Image
                        src="/dpi-logo.png"
                        alt=""
                        width={28}
                        height={28}
                        className="object-contain opacity-90"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-700 tracking-wider">
                        {prog.short}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {prog.seats} seats
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-semibold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {prog.name}
                </h3>

                <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
                  {prog.description}
                </p>

                {/* Meta */}
                <div className="mt-5 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {prog.duration}
                  </span>
                  <span>•</span>
                  <span>Diploma in Engineering</span>
                </div>

                {/* Highlights */}
                <div className="mt-5 pt-5 border-t border-gray-50 flex flex-wrap gap-2">
                  {prog.highlights.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CAMPUS HIGHLIGHT ===================== */}
      <section className="py-24 bg-[#f8faf9]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Life at DPI
            </h2>
            <p className="text-gray-500 mt-4">
              A sprawling campus with modern laboratories, workshops, hostels
              and a strong academic environment.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900">
                Modern Computer Laboratories
              </h3>
              <p className="text-gray-600 mt-5 leading-relaxed">
                Well-equipped computer labs with high-speed internet and modern
                software for programming, networking, database, web development
                and emerging technologies — preparing students for real industry
                demands.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Programming", "Networking", "Web Dev", "Database"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="md:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-10 rounded-[2rem] flex flex-col justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium tracking-widest uppercase">
                  Campus
                </p>
                <p className="text-4xl font-bold mt-4">16+ Acres</p>
                <p className="text-emerald-50 mt-3 leading-relaxed">
                  Academic buildings, workshops, laboratories, hostels, mosque,
                  auditorium and playground.
                </p>
              </div>
              <div className="mt-10 pt-6 border-t border-white/20">
                <p className="text-sm text-emerald-100">
                  Government Polytechnic under
                </p>
                <p className="font-semibold mt-1">
                  Bangladesh Technical Education Board (BTEB)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section className="bg-gray-950 text-white py-24">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to start your technical career?
          </h2>
          <p className="text-gray-400 mt-5 text-lg max-w-xl mx-auto">
            Admissions are open for the upcoming academic session. Join one of
            the oldest and most respected polytechnics in northern Bangladesh.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-semibold text-base transition-all"
            >
              Apply Now
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-4 rounded-2xl font-medium transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}