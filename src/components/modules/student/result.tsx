"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Filters, ResultsClientProps } from "@/types/result.interface";
import { RollResultCard } from "./RollResultCard";
import { FilterChip, FilterSelect } from "./Ui";
import { GroupCard } from "./groupCard";
import { generateResultPdf } from "@/action/generateResultPdf";


export default function ResultsClient({
  initialSingleResult,
  groups,
  groupMeta,
  departments,
  shifts,
  semesters,
  page,
  roll,
  filters,
}: ResultsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [searchRoll, setSearchRoll] = useState(roll);

  const safeGroups = Array.isArray(groups) ? groups : [];
  const totalPages =
    groupMeta.total && groupMeta.limit
      ? Math.ceil(groupMeta.total / groupMeta.limit)
      : 1;

  const hasFilters = !!(
    filters.departmentId ||
    filters.shiftId ||
    filters.semesterId ||
    filters.groupId ||
    roll
  );

  function navigate(
    overrides: Partial<Filters & { roll: string; page: number }>
  ) {
    const next = { roll: searchRoll, page: 1, ...filters, ...overrides };
    const params = new URLSearchParams();

    if (next.roll) params.set("roll", next.roll);
    if (next.page > 1) params.set("page", String(next.page));
    if (next.departmentId) params.set("departmentId", next.departmentId);
    if (next.shiftId) params.set("shiftId", next.shiftId);
    if (next.semesterId) params.set("semesterId", next.semesterId);
    if (next.groupId) params.set("groupId", next.groupId);

    startTransition(() =>
      router.push(`/dashboard/student/results?${params.toString()}`)
    );
  }

  const handlePdfPreview = async () => {
    const pdfBuffer = await generateResultPdf(groups);

    const blob = new Blob(
      [new Uint8Array(pdfBuffer)],
      { type: "application/pdf" }
    );

    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };

  function handleRollSearch(value: string) {
    setSearchRoll(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => navigate({ roll: value, page: 1 }),
      600
    );
  }

  function handleFilter(key: keyof Filters, value: string) {
    const cascade: Partial<Filters> = { [key]: value };

    if (key === "departmentId") {
      cascade.shiftId = "";
      cascade.semesterId = "";
      cascade.groupId = "";
    }
    if (key === "shiftId") {
      cascade.semesterId = "";
      cascade.groupId = "";
    }
    if (key === "semesterId") cascade.groupId = "";

    navigate(cascade);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Loader */}
      {isPending && (
        <div className="fixed top-0 inset-x-0 z-50 h-[3px] bg-gray-200">
          <div className="h-full bg-indigo-600 w-2/3 animate-pulse" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-1">
              Student Portal
            </p>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Results & Groups
            </h1>
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setSearchRoll("");
                startTransition(() =>
                  router.push("/dashboard/student/results")
                );
              }}
              className="text-xs font-medium text-gray-600 border border-gray-300 bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-red-50 hover:text-red-600 transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800">
              Search by Roll Number
            </h2>
          </div>

          <div className="px-5 py-4">
            <div className="relative">
              <input
                type="text"
                value={searchRoll}
                onChange={(e) => handleRollSearch(e.target.value)}
                placeholder="Enter roll number…"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-4 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />

              {isPending && searchRoll && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
              )}
            </div>

            {initialSingleResult ? (
              <RollResultCard result={initialSingleResult} />
            ) : searchRoll && !isPending ? (
              <div className="mt-4 border border-dashed border-gray-300 rounded-xl py-10 text-center">
                <p className="text-sm text-gray-600">
                  No result found for{" "}
                  <span className="font-medium text-gray-900">
                    {searchRoll}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-4">

          {/* Filters */}
          <div className="rounded-2xl border border-gray-400 bg-gray-100 shadow-sm px-5 py-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-800">
                Student Groups
              </p>
              {groupMeta.total > 0 && (
                <span className="text-xs text-gray-600">
                  {groupMeta.total} groups
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <FilterSelect
                label="Department"
                value={filters.departmentId}
                options={departments}
                placeholder="All"
                onChange={(v) => handleFilter("departmentId", v)}
              />
              <FilterSelect
                label="Shift"
                value={filters.shiftId}
                options={shifts}
                placeholder="All"
                onChange={(v) => handleFilter("shiftId", v)}
                disabled={!filters.departmentId}
              />
              <FilterSelect
                label="Semester"
                value={filters.semesterId}
                options={semesters.map((s) => ({
                  id: s.id,
                  name: ` ${s.semesterNo}`,
                }))}
                placeholder="All Semesters"
                onChange={(v) => handleFilter("semesterId", v)}
                disabled={!filters.shiftId}
              />
              <FilterSelect
                label="Group"
                value={filters.groupId}
                options={safeGroups.map((g) => ({ id: g.id, name: g.name }))}
                placeholder="All"
                onChange={(v) => handleFilter("groupId", v)}
                disabled={!filters.semesterId}
              />

              <button
                onClick={handlePdfPreview}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Preview & Download PDF
              </button>
            </div>

            {hasFilters && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-200 pt-3">
                {filters.departmentId && (
                  <FilterChip
                    label={
                      departments.find(
                        (d) => String(d.id) === filters.departmentId
                      )?.name || ""
                    }
                    onRemove={() => handleFilter("departmentId", "")}
                  />
                )}
              </div>
            )}
          </div>

          {/* Group List */}
          {safeGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
              <p className="text-gray-500">No groups found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeGroups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-600">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate({ page: page - 1 })}
                  disabled={page <= 1 || isPending}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                >
                  Prev
                </button>

                <button
                  onClick={() => navigate({ page: page + 1 })}
                  disabled={page >= totalPages || isPending}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}