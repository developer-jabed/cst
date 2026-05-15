import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[100vh] flex items-center bg-gradient-to-br from-[#f8f7f4] to-white overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.8px,transparent_1px)] [background-size:60px_60px]" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="pt-20 lg:pt-0">
            <div className="inline-flex items-center gap-3 mb-6 bg-white/70 backdrop-blur-md px-6 py-2.5 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-700 text-xs font-semibold tracking-[3px] uppercase">
                EST. 1968 • DINAJPUR, BANGLADESH
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
              Department of{" "}
              <span className="text-emerald-600">
                Computer Science &amp; Technology
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 max-w-lg leading-relaxed">
              Dinajpur Polytechnic Institute — Nurturing skilled technologists,
              innovators, and future leaders through quality technical education
              since 1968.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/admission"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-9 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                Apply Now
              </Link>
              <Link
                href="/programs"
                className="border border-gray-300 hover:border-emerald-600 px-9 py-4 rounded-2xl font-medium transition-all"
              >
                Explore Programs
              </Link>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="hidden lg:flex justify-center relative">
            <div className="relative w-full max-w-lg">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-emerald-100">
                <div className="aspect-video bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-6xl font-bold tracking-tighter">
                      DPI
                    </div>
                    <div className="text-xl -mt-2">CST</div>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-emerald-100">
                <div className="text-emerald-600 text-5xl font-bold">92%</div>
                <div className="text-sm text-gray-600 mt-1">
                  Graduate Employment Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-6">
          {[
            { number: "4500+", label: "Students" },
            { number: "58+", label: "Years of Excellence" },
            { number: "92%", label: "Employment Rate" },
            { number: "120+", label: "Faculty Members" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold text-emerald-600">
                {stat.number}
              </div>
              <div className="text-gray-500 mt-2 text-sm tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-emerald-600 text-sm font-semibold tracking-widest">
                ACADEMIC PROGRAMS
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">
                Our Departments
              </h2>
            </div>
            <Link
              href="/programs"
              className="text-emerald-600 hover:underline font-medium mt-4 md:mt-0"
            >
              View All Programs →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Computer Science & Technology",
              "Electrical & Electronics Engineering",
              "Civil Engineering",
              "Mechanical Engineering",
              "Telecommunication Technology",
            ].map((prog) => (
              <div
                key={prog}
                className="group border border-gray-100 hover:border-emerald-200 p-8 rounded-3xl transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-2 w-12 bg-emerald-600 rounded mb-6 group-hover:w-16 transition-all" />
                <h3 className="text-2xl font-semibold text-gray-900">{prog}</h3>
                <p className="text-gray-600 mt-4">
                  4 Years • Diploma in Engineering
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAMPUS LIFE */}
      <section className="py-24 bg-[#f8f7f4]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-bold text-center mb-16">
            Life at DPI CST
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 bg-white p-10 rounded-3xl shadow-sm">
              <h3 className="text-3xl font-semibold">
                Modern Computer Laboratories
              </h3>
              <p className="text-gray-600 mt-6 leading-relaxed">
                Equipped with latest hardware, high-speed internet, and
                specialized software for AI, Web Development, Networking, and
                Cybersecurity.
              </p>
            </div>

            <div className="md:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-10 rounded-3xl flex flex-col justify-between">
              <div>
                <p className="uppercase tracking-widest text-emerald-100 text-sm">
                  Student Achievement
                </p>
                <p className="text-5xl font-bold mt-6">1st Place</p>
                <p className="text-2xl mt-2">National ICT Olympiad 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gray-900 text-white py-24">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-5xl font-bold">
            Ready to Begin Your Tech Journey?
          </h2>
          <p className="text-gray-400 mt-4 text-lg">
            Admissions Open for 2026-2027 Academic Session
          </p>

          <Link
            href="/admission"
            className="inline-block mt-10 bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-4 rounded-2xl font-semibold text-lg transition-all"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </main>
  );
}
