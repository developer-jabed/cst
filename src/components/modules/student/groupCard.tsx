import { Group } from "@/types/result.interface";
import { StudentRow } from "./studentRow";

function StatRing({
  value,
  total,
  color,
  label,
}: {
  value: number;
  total: number;
  color: string;
  label: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black leading-none" style={{ color }}>
            {value}
          </span>
          <span className="text-[9px] font-bold text-gray-400">
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>

      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}

export function GroupCard({ group }: { group: Group }) {
  const students = group.students ?? [];
  const dept = group.semester?.department?.name ?? "—";
  const shift = group.semester?.shift?.name ?? "—";
  const semNo = group.semester?.semesterNo;

  const withResult = students.filter((s) => (s.diplomaResults?.length ?? 0) > 0);

  const passCount = withResult.filter(
    (s) => s.diplomaResults?.[0]?.status?.toLowerCase() === "passed"
  ).length;

  const failCount = withResult.filter(
    (s) => s.diplomaResults?.[0]?.status?.toLowerCase() === "failed"
  ).length;

  const referCount = withResult.length - passCount - failCount;

  const total = withResult.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-gray-200 bg-gray-50">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-200">
            👥
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 capitalize">
              {group.name}
            </h3>

            <div className="flex gap-2 mt-1">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md ring-1 ring-indigo-200">
                {dept}
              </span>

              <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md ring-1 ring-amber-200">
                Shift {shift}
              </span>

              {semNo && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md ring-1 ring-emerald-200">
                  Sem {semNo}
                </span>
              )}
            </div>
          </div>
        </div>

        {total > 0 && (
          <div className="flex gap-4">
            <StatRing value={passCount} total={total} color="#16a34a" label="Passed" />
            <StatRing value={failCount} total={total} color="#dc2626" label="Failed" />
            {referCount > 0 && (
              <StatRing value={referCount} total={total} color="#ca8a04" label="Referred" />
            )}

            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border border-gray-200 bg-gray-50">
              <span className="text-base font-black text-gray-900">{students.length}</span>
              <span className="text-[9px] text-gray-400">total</span>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Student", "Registration", "GPA", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-2 text-left text-[10px] uppercase text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <StudentRow key={s.id} student={s} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400">
          No students in this group
        </div>
      )}
    </div>
  );
}