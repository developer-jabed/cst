import { gpaColor } from "@/lib/utils";
import { Student } from "@/types/result.interface";
import { useState } from "react";
import { Avatar, CircleGpa, StatusBadge } from "./Ui";


export function StudentRow({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const result = student.diplomaResults?.[0] ?? null;
  const latestGpa = result?.gpa3 ?? result?.gpa2 ?? result?.gpa1;
  const pct = latestGpa ? Math.min((latestGpa / 4) * 100, 100) : 0;
  const { stroke } = latestGpa ? gpaColor(latestGpa) : { stroke: "#ffffff20" };

  const gpaEntries = [
    { label: "1st Sem", value: result?.gpa1 },
    { label: "2nd Sem", value: result?.gpa2 },
    { label: "3rd Sem", value: result?.gpa3 },
    { label: "Overall", value: result?.overallGpa },
  ].filter((e) => e.value != null) as { label: string; value: number }[];

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer transition-all duration-200 hover:bg-white/[0.03] group"
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Avatar name={student.name} photo={student.profilePhoto} size={34} />
            <div>
              <p className="text-sm font-semibold text-blue-400 leading-tight">
                {student.name}
              </p>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                {student.roll}
              </p>
            </div>
          </div>
        </td>
        <td className="px-5 py-3.5 text-[12px] text-gray-400 font-mono">
          {student.registration ?? "—"}
        </td>
        <td className="px-5 py-3.5">
          {result ? (
            <div className="flex items-center gap-2.5 min-w-[130px]">
              {/* Mini arc ring */}
              <div className="relative w-8 h-8 shrink-0">
                <svg width="32" height="32" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    cx="16" cy="16" r="11" fill="none"
                    stroke={stroke} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 11}
                    strokeDashoffset={2 * Math.PI * 11 * (1 - pct / 100)}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: stroke }}>
                {latestGpa?.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-red-400">No result</span>
          )}
        </td>
        <td className="px-5 py-3.5">
          {result ? (
            <StatusBadge status={result.status} />
          ) : (
            <span className="text-[11px] text-gray-400">—</span>
          )}
        </td>
        <td className="px-5 py-3.5 text-right">
          <svg
            className={`ml-auto text-white/20 transition-transform duration-300 group-hover:text-white/40 ${open ? "rotate-180" : ""}`}
            width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </td>
      </tr>

      {open && result && (
        <tr>
          <td colSpan={5} className="px-5 pb-5 pt-1">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white/80">{result.instituteName}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {result.semester} Semester · {result.examYear}
                  </p>
                </div>
                <StatusBadge status={result.status} />
              </div>

              {/* Circle GPAs */}
              <div className="flex flex-wrap gap-5 pt-1">
                {gpaEntries.map(({ label, value }) => (
                  <CircleGpa key={label} label={label} value={value} size={80} />
                ))}
              </div>

              {/* Failed / Referred */}
              {((result.failedSubjects?.length ?? 0) > 0 ||
                (result.referredSubjects?.length ?? 0) > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/8">
                  {result.failedSubjects?.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/30 px-2.5 py-0.5">
                      Failed: {s}
                    </span>
                  ))}
                  {result.referredSubjects?.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 px-2.5 py-0.5">
                      Referred: {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}