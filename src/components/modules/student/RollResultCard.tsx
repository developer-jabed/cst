/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, CircleGpa, StatusBadge } from "./Ui";

export function RollResultCard({ result: r }: { result: any }) {
  const gpaEntries: { label: string; value: number }[] = [
    { label: "1st Sem", value: r.gpa1 },
    { label: "2nd Sem", value: r.gpa2 },
    { label: "3rd Sem", value: r.gpa3 },
    { label: "Overall", value: r.overallGpa },
  ].filter((e) => e.value != null) as { label: string; value: number }[];

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      
      {/* Top bar */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3.5">
          <Avatar name={r.student?.name} photo={r.student?.profilePhoto} size={46} />
          <div>
            <p className="font-bold text-gray-900">
              {r.student?.name ?? "—"}
            </p>

            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
              Roll: {r.roll} · Reg: {r.student?.registration ?? "—"}
            </p>

            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
              {r.instituteName}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={r.status} />
          <span className="text-[10px] text-gray-400">
            {r.examYear} · {r.regulation} Reg
          </span>
        </div>
      </div>

      {/* GPA */}
      <div className="px-5 py-5 flex flex-wrap gap-6">
        {gpaEntries.map(({ label, value }) => (
          <CircleGpa key={label} label={label} value={value} size={88} />
        ))}
      </div>
    </div>
  );
}