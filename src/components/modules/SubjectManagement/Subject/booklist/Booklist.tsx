"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { BookOpen, Search, Layers } from "lucide-react";

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

function creditTone(credits?: number) {
  if (!credits) return { bar: "#94a3b8", soft: "bg-slate-100 text-slate-600" };
  if (credits >= 4)
    return { bar: "#c9a24b", soft: "bg-amber-50 text-amber-800 ring-amber-200" };
  if (credits >= 2)
    return {
      bar: "#059669",
      soft: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    };
  return { bar: "#0d9488", soft: "bg-teal-50 text-teal-800 ring-teal-200" };
}

export default function BooklistClient({
  initialGroups,
  failed,
}: {
  initialGroups: SemesterGroup[];
  failed: boolean;
}) {
  const groups = useMemo(
    () =>
      [...initialGroups].sort((a, b) => a.semester.order - b.semester.order),
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

  const totalBooks = useMemo(
    () => groups.reduce((n, g) => n + g.books.length, 0),
    [groups]
  );

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 md:px-10 md:py-16">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#b8923f]">
              Academics
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Course Catalog
            </h1>
            <p className="mt-2 max-w-md text-[15px] text-slate-600">
              Textbooks and subjects, organized by semester.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or code"
                className="w-full rounded-xl border border-[#e8e0d0] bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#c9a24b] focus:ring-2 focus:ring-[#c9a24b]/20 sm:w-64"
              />
            </div>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="rounded-xl border border-[#e8e0d0] bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#c9a24b] focus:ring-2 focus:ring-[#c9a24b]/20"
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

        {/* Summary chips */}
        {!failed && groups.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d0] bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              <Layers className="h-3.5 w-3.5 text-[#064e3b]" />
              {groups.length} semester{groups.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e0d0] bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              <BookOpen className="h-3.5 w-3.5 text-[#c9a24b]" />
              {totalBooks} subject{totalBooks !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Semester rail */}
        {!failed && groups.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {groups.map((g) => {
              const isActive = g.semester.id === activeSemesterId;
              return (
                <button
                  key={g.semester.id}
                  onClick={() => setActiveSemesterId(g.semester.id)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-[#064e3b] to-[#0f766e] text-white shadow-md shadow-emerald-900/20"
                      : "border border-[#e8e0d0] bg-white text-slate-600 shadow-sm hover:border-[#c9a24b]/40 hover:text-[#064e3b]"
                  }`}
                >
                  {g.semester.name}
                  <span
                    className={`ml-1.5 text-[11px] ${
                      isActive ? "text-emerald-100/80" : "text-slate-400"
                    }`}
                  >
                    ({g.books.length})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Error */}
        {failed && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-sm text-rose-800">
            The catalog did not load. Refresh the page to try again.
          </div>
        )}

        {/* Empty catalog */}
        {!failed && groups.length === 0 && (
          <div className="rounded-2xl border border-[#e8e0d0] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f7f3ea] text-[#c9a24b]">
              <BookOpen className="h-6 w-6" />
            </div>
            <p className="font-semibold text-slate-800">No subjects yet</p>
            <p className="mt-1 text-sm text-slate-500">
              No subjects have been added to the catalog.
            </p>
          </div>
        )}

        {/* Active semester panel */}
        {!failed && activeGroup && (
          <div className="overflow-hidden rounded-2xl border border-[#e8e0d0] bg-white shadow-[0_4px_24px_rgba(6,78,59,0.06)]">
            <div className="h-1 w-full bg-gradient-to-r from-[#064e3b] via-[#c9a24b] to-[#0f766e]" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e0d0] bg-[#f7f3ea]/80 px-6 py-4 sm:px-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {activeGroup.semester.name}
                </h2>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Semester
                </p>
              </div>
              <span className="rounded-full border border-[#e8e0d0] bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {visibleBooks.length} of {activeGroup.books.length} subjects
              </span>
            </div>

            {visibleBooks.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-slate-500">
                Nothing matches this search or department in this semester.
              </div>
            ) : (
              <ul className="divide-y divide-[#f0ebe3]">
                {visibleBooks.map((book) => {
                  const tone = creditTone(book.credits);
                  return (
                    <li
                      key={book.id}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[#faf8f3] sm:gap-5 sm:px-8 sm:py-5"
                    >
                      <span
                        className="h-10 w-1.5 shrink-0 rounded-full transition-transform group-hover:scale-y-110"
                        style={{ backgroundColor: tone.bar }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-slate-900">
                          {book.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="rounded-md bg-[#f7f3ea] px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                            {book.code}
                          </span>
                          {book.department && (
                            <span>{book.department.name}</span>
                          )}
                        </div>
                      </div>
                      {typeof book.credits === "number" && (
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${tone.soft}`}
                        >
                          {book.credits} credit
                          {book.credits === 1 ? "" : "s"}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}