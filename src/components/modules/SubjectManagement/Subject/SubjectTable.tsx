/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  // We no longer need to pass searchParams — we'll read it directly
}

export default function SubjectsTablePage({
  subjects,

  totalPages,
  currentPage,
}: SubjectsTablePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();   // ← This is the safe way
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "" && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Always reset to page 1 when changing filters
    if (key !== "page") {
      params.delete("page");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/admin/subjects?${queryString}` : "/admin/subjects";

    startTransition(() => {
      router.push(newUrl);
    });
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Manage all academic subjects</p>
        </div>
        <CreateSubjectModal />
      </div>

    
      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Code</TableHead>
              <TableHead>Subject Name</TableHead>
              <TableHead>Short Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead className="text-right">Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-72 text-center text-muted-foreground">
                  No subjects found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium text-primary">
                    {subject.code}
                  </TableCell>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>
                    <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                      {subject.shortName}
                    </span>
                  </TableCell>
                  <TableCell>{subject.department?.name || "—"}</TableCell>
                  <TableCell>{subject.semester?.name || "—"}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {subject.credits || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("page", pageNum.toString())}
              disabled={isPending}
            >
              {pageNum}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}