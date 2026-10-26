"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CreateSubjectModal from "./Subject";

interface Subject {
  id: number;
  name: string;
  shortName: string;
  code: string;
  credits?: number;
  department?: { name: string };
  semester?: { name: string };
}

interface SubjectsTablePageProps {
  subjects: Subject[];
  departments: any[];
  semesters: any[];
  totalPages: number;
  currentPage: number;
}

export default function SubjectsTablePage({
  subjects,
  totalPages,
  currentPage,
}: SubjectsTablePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "" && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.delete("page");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(newUrl);
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <span className="w-1.5 h-8 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Subjects
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage all academic subjects across departments
            </p>
          </div>
        </div>
        <CreateSubjectModal />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-32 px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Code
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Subject Name
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Short Name
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Department
              </TableHead>
              <TableHead className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Semester
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Credits
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-72 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2 py-8">
                    <p className="text-sm font-medium">No subjects found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow
                  key={subject.id}
                  className="hover:bg-slate-50/70 transition-colors border-slate-50"
                >
                  <TableCell className="px-6 py-4">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs ring-1 ring-emerald-100">
                      {subject.code}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-semibold text-slate-800">
                    {subject.name}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {subject.shortName}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 text-sm">
                    {subject.department?.name || "—"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium ring-1 ring-indigo-100">
                      {subject.semester?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-bold text-slate-800 tabular-nums">
                      {subject.credits ?? "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-400">
            Page{" "}
            <span className="font-semibold text-slate-600">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-600">{totalPages}</span>
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter("page", pageNum.toString())}
                  disabled={isPending}
                  className={
                    currentPage === pageNum
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}