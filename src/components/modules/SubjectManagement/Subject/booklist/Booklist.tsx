"use client";

import { useMemo, useState, useDeferredValue } from "react";

type Book = {
  id: number;
  name: string;
  shortName: string;
  code: string;
  credits?: number;
  department?: { id: number; name: string };
};

type SemesterGroup = {
  semester: { id: number; name: string; order: number };
  books: Book[];
};

export default function BooklistClient({
  initialGroups,
  failed,
}: {
  initialGroups: SemesterGroup[];
  failed: boolean;
}) {
  const groups = useMemo(
    () => [...initialGroups].sort((a, b) => a.semester.order - b.semester.order),
    [initialGroups]
  );

  const [activeSemesterId, setActiveSemesterId] = useState<number | null>(
    groups[0]?.semester.id ?? null
  );
  const [departmentId, setDepartmentId] = useState("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const departments = useMemo(() => {
    const map = new Map<number, string>();
    for (const g of groups) {
      for (const b of g.books) {
        if (b.department) map.set(b.department.id, b.department.name);
      }
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [groups]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.semester.id === activeSemesterId) ?? null,
    [groups, activeSemesterId]
  );

  const visibleBooks = useMemo(() => {
    if (!activeGroup) return [];
    const q = deferredQuery.trim().toLowerCase();
    if (departmentId === "all" && !q) return activeGroup.books;
    return activeGroup.books.filter((b) => {
      const matchesDept =
        departmentId === "all" || String(b.department?.id) === departmentId;
      if (!matchesDept) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.shortName?.toLowerCase().includes(q)
      );
    });
  }, [activeGroup, departmentId, deferredQuery]);

  return (
    <div className="min-h-screen bg-[#EAECE6]">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1
              className="text-4xl leading-tight text-[#16233F]"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              Course Catalog
            </h1>
            <p className="mt-2 text-[15px] text-[#5C6672]">
              Textbooks and subjects, organized by semester.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3ABB3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or code"
                className="w-full rounded-lg border border-[#D6DAD2] bg-white py-2.5 pl-9 pr-4 text-sm text-[#16233F] shadow-sm placeholder:text-[#A3ABB3] transition focus:border-[#B8862E] focus:outline-none focus:ring-2 focus:ring-[#B8862E]/20 sm:w-64"
              />
            </div>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="rounded-lg border border-[#D6DAD2] bg-white px-4 py-2.5 text-sm text-[#16233F] shadow-sm transition focus:border-[#B8862E] focus:outline-none focus:ring-2 focus:ring-[#B8862E]/20"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Semester rail */}
        {!failed && groups.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {groups.map((g) => {
              const isActive = g.semester.id === activeSemesterId;
              return (
                <button
                  key={g.semester.id}
                  onClick={() => setActiveSemesterId(g.semester.id)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#16233F] text-white shadow-md shadow-[#16233F]/20"
                      : "bg-white text-[#5C6672] shadow-sm hover:text-[#16233F] hover:shadow-md"
                  }`}
                >
                  {g.semester.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Body states */}
        {failed && (
          <div className="rounded-xl border border-[#E4C9C9] bg-[#FBF2F2] p-8 text-sm text-[#8A4B4B]">
            The catalog did not load. Refresh the page to try again.
          </div>
        )}

        {!failed && groups.length === 0 && (
          <div className="rounded-xl border border-[#D6DAD2] bg-white p-8 text-sm text-[#5C6672]">
            No subjects have been added yet.
          </div>
        )}

        {!failed && activeGroup && (
          <div className="overflow-hidden rounded-2xl border border-[#DFE3D9] bg-white shadow-[0_4px_24px_rgba(22,35,63,0.06)]">
            <div className="flex items-center justify-between border-b border-[#EDEFEA] bg-[#FAFAF7] px-8 py-5">
              <div>
                <h2
                  className="text-xl text-[#16233F]"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {activeGroup.semester.name}
                </h2>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-[#A3ABB3]">
                  Semester
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#5C6672] shadow-sm">
                {visibleBooks.length} of {activeGroup.books.length} subjects
              </span>
            </div>

            {visibleBooks.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#5C6672]">
                Nothing matches this search or department in this semester.
              </div>
            ) : (
              <ul className="divide-y divide-[#EDEFEA]">
                {visibleBooks.map((book) => (
                  <li
                    key={book.id}
                    className="group flex items-center gap-5 px-8 py-5 transition-colors hover:bg-[#FAFAF7]"
                  >
                    <span
                      className="h-10 w-1.5 shrink-0 rounded-full transition-transform group-hover:scale-y-110"
                      style={{ backgroundColor: creditColor(book.credits) }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-[#16233F]">
                        {book.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8A93A0]">
                        <span className="rounded bg-[#F1F2ED] px-1.5 py-0.5 font-mono text-[11px] text-[#5C6672]">
                          {book.code}
                        </span>
                        {book.department && <span>{book.department.name}</span>}
                      </div>
                    </div>
                    {typeof book.credits === "number" && (
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${creditColor(book.credits)}1A`,
                          color: creditColor(book.credits),
                        }}
                      >
                        {book.credits} credit{book.credits === 1 ? "" : "s"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function creditColor(credits?: number) {
  if (!credits) return "#8A93A0";
  if (credits >= 4) return "#B8862E";
  if (credits >= 2) return "#5B7A6B";
  return "#5B7FA6";
}