import PublicFooter from "@/components/shared/PublicFooter";
import PublicNavbar from "@/components/shared/PublicNavbar";
import React from "react";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col relative overflow-x-hidden">
      {/* Global Artistic Background */}
      <div
        className="fixed inset-0 z-[-1] opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 20%, #10b981 0.5px, transparent 1px),
            radial-gradient(circle at 75% 60%, #10b981 0.5px, transparent 1px),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800' fill='none'%3E%3Cpath d='M150 120 Q280 60 420 150' stroke='%2310b981' stroke-width='14' opacity='0.25'/%3E%3Cpath d='M520 480 Q680 380 850 520' stroke='%2310b981' stroke-width='12' opacity='0.2'/%3E%3Crect x='680' y='180' width='140' height='220' rx='25' fill='%2310b981' fill-opacity='0.08'/%3E%3C/svg%3E")
          `,
          backgroundSize: "cover, 800px 600px",
          backgroundPosition: "center, center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Subtle Grid Overlay */}
      <div className="fixed inset-0 z-[-2] opacity-[0.018] bg-[radial-gradient(#10b981_0.6px,transparent_1px)] [background-size:50px_50px]" />

      <PublicNavbar />

      <main className="flex-1 relative">
        <div className="mx-auto w-full max-w-screen-2xl px-5 md:px-8 lg:px-10 py-8">
          {children}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default CommonLayout;
