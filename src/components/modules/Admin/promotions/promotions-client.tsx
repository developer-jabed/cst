/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useActionState, useState, useEffect, useTransition, useMemo } from "react";
import { useFormStatus } from "react-dom";
import {
  promoteBatch,
  promoteSingleStudent,
  applyDiplomaResult,
} from "@/service/enrollment/enrollment.service";
import { getStudents } from "@/service/student/student.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowUpCircle,
  UserCog,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Users,
  GraduationCap,
  Search,
  Building2,
  Sparkles,
  ArrowRight,
  Layers,
  BookOpen,
  UserCheck,
  RefreshCw,
} from "lucide-react";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
type GroupOption = {
  id: number;
  name: string;
  session: string;
  department?: { name?: string; shortName?: string };
  shift?: { name?: string; shortName?: string };
  currentSemester?: { id: number; name: string };
  _count?: { students?: number };
};

type SemesterOption = { id: number; name: string; order?: number };

type StudentOption = {
  id: number;
  name: string;
  roll?: string;
  registration?: string;
  currentSemester?: { id: number; name: string };
  group?: {
    id: number;
    name: string;
    session?: string;
    department?: { shortName?: string };
    shift?: { name?: string };
  };
};

type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  data?: any;
};

const initialState: ActionState = {
  success: false,
  message: "",
  errors: {},
  data: null,
};

interface PromotionsClientProps {
  groups: GroupOption[];
  semesters: SemesterOption[];
  students: StudentOption[];
}

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
function formatGroupLabel(g: GroupOption): string {
  const parts: string[] = [];
  if (g.currentSemester?.name) parts.push(`${g.currentSemester.name} Semester`);
  parts.push(g.name);
  if (g.shift?.name) parts.push(g.shift.name);
  if (g.department?.shortName) parts.push(g.department.shortName);
  return parts.join(" · ");
}

function formatStudentMeta(s: StudentOption): string {
  const parts: string[] = [];
  if (s.roll) parts.push(`Roll ${s.roll}`);
  if (s.registration) parts.push(`Reg ${s.registration}`);
  return parts.join(" · ");
}

// ────────────────────────────────────────────────
// Small pieces
// ────────────────────────────────────────────────
function SubmitButton({
  label,
  icon: Icon,
  className,
}: {
  label: string;
  icon: any;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className={`w-full font-semibold tracking-wide shadow-md transition-all hover:shadow-lg sm:w-auto ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Icon className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

function ResultBanner({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return (
    <Alert
      variant={state.success ? "default" : "destructive"}
      className={
        state.success
          ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100"
          : ""
      }
    >
      {state.success ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle className="font-semibold">{state.success ? "Success" : "Error"}</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}

// ────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────
export default function PromotionsClient({ groups, semesters, students }: PromotionsClientProps) {
  const [batchState, batchAction] = useActionState<ActionState, FormData>(
    promoteBatch,
    initialState
  );
  const [singleState, singleAction] = useActionState<ActionState, FormData>(
    promoteSingleStudent,
    initialState
  );
  const [resultState, resultAction] = useActionState<ActionState, FormData>(
    applyDiplomaResult,
    initialState
  );

  const [studentQuery, setStudentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentOption[]>(students.slice(0, 30));
  const [isSearching, startSearch] = useTransition();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  // Batch form state
  const [fromGroupId, setFromGroupId] = useState<string>("");
  const [fromSemesterId, setFromSemesterId] = useState<string>("");
  const [toGroupId, setToGroupId] = useState<string>("");
  const [toSemesterId, setToSemesterId] = useState<string>("");

  // Debounced student search
  useEffect(() => {
    const handle = setTimeout(() => {
      if (!studentQuery) {
        setSearchResults(students.slice(0, 30));
        return;
      }
      startSearch(async () => {
        const res = await getStudents({ searchTerm: studentQuery, limit: 30 });
        setSearchResults(res.success ? res.data : []);
      });
    }, 350);
    return () => clearTimeout(handle);
  }, [studentQuery, students]);

  const selectedStudent = useMemo(
    () => searchResults.find((s) => String(s.id) === selectedStudentId),
    [searchResults, selectedStudentId]
  );

  const fromGroup = useMemo(
    () => groups.find((g) => String(g.id) === fromGroupId),
    [groups, fromGroupId]
  );

  const toGroup = useMemo(
    () => groups.find((g) => String(g.id) === toGroupId),
    [groups, toGroupId]
  );

  // When From Group changes → auto-fill From Semester
  const handleFromGroupChange = (value: string) => {
    setFromGroupId(value);
    const g = groups.find((item) => String(item.id) === value);
    if (g?.currentSemester?.id) {
      setFromSemesterId(String(g.currentSemester.id));
    } else {
      setFromSemesterId("");
    }
  };

  // When To Group changes → auto-fill To Semester (optional convenience)
  const handleToGroupChange = (value: string) => {
    setToGroupId(value);
    const g = groups.find((item) => String(item.id) === value);
    if (g?.currentSemester?.id) {
      setToSemesterId(String(g.currentSemester.id));
    } else {
      setToSemesterId("");
    }
  };

  return (
    <Tabs defaultValue="batch" className="w-full">
      {/* ── Tabs ─────────────────────────────────────── */}
      <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-xl bg-muted/60 p-1.5 sm:grid-cols-3">
        <TabsTrigger
          value="batch"
          className="flex items-center gap-2 rounded-lg py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <Users className="h-4 w-4" />
          Promote Batch
        </TabsTrigger>
        <TabsTrigger
          value="single"
          className="flex items-center gap-2 rounded-lg py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <UserCog className="h-4 w-4" />
          Move Student
        </TabsTrigger>
        <TabsTrigger
          value="result"
          className="flex items-center gap-2 rounded-lg py-2.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          <FileCheck2 className="h-4 w-4" />
          Apply Result
        </TabsTrigger>
      </TabsList>

      {/* ── Promote Batch ─────────────────────────────── */}
      <TabsContent value="batch" className="mt-6">
        <Card className="overflow-hidden border-0 shadow-xl shadow-indigo-500/5">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 px-6 py-5 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <ArrowUpCircle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-white">
                  Promote a Batch
                </CardTitle>
                <CardDescription className="mt-1 text-indigo-100">
                  Move students from one Group + Semester to another Group + Semester.
                  Students already marked RETAKING are skipped.
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="pt-6">
            <form action={batchAction} className="space-y-6">
              {/* FROM section */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-900 dark:bg-indigo-950/20">
                <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="h-4 w-4" />
                  From
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fromGroupId" className="flex items-center gap-1.5 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                      From Group
                    </Label>
                    <Select
                      name="fromGroupId"
                      value={fromGroupId}
                      onValueChange={handleFromGroupChange}
                    >
                      <SelectTrigger id="fromGroupId" className="h-11">
                        <SelectValue placeholder="Select source group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            <div className="flex flex-col gap-0.5 py-0.5">
                              <span className="font-medium">{formatGroupLabel(g)}</span>
                              <span className="text-xs text-muted-foreground">
                                {g.session}
                                {typeof g._count?.students === "number" &&
                                  ` · ${g._count.students} students`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {batchState.errors?.fromGroupId && (
                      <p className="text-xs text-destructive">{batchState.errors.fromGroupId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromSemesterId" className="flex items-center gap-1.5 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                      From Semester
                    </Label>
                    <Select
                      name="fromSemesterId"
                      value={fromSemesterId}
                      onValueChange={setFromSemesterId}
                    >
                      <SelectTrigger id="fromSemesterId" className="h-11">
                        <SelectValue placeholder="Select from semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            Semester {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {batchState.errors?.fromSemesterId && (
                      <p className="text-xs text-destructive">{batchState.errors.fromSemesterId}</p>
                    )}
                    {fromGroup?.currentSemester && (
                      <p className="text-xs text-muted-foreground">
                        Group currently points to Semester {fromGroup.currentSemester.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>

              {/* TO section */}
              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-5 dark:border-violet-900 dark:bg-violet-950/20">
                <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  <Sparkles className="h-4 w-4" />
                  To
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="toGroupId" className="flex items-center gap-1.5 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-violet-500" />
                      To Group
                    </Label>
                    <Select
                      name="toGroupId"
                      value={toGroupId}
                      onValueChange={handleToGroupChange}
                    >
                      <SelectTrigger id="toGroupId" className="h-11">
                        <SelectValue placeholder="Select target group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            <div className="flex flex-col gap-0.5 py-0.5">
                              <span className="font-medium">{formatGroupLabel(g)}</span>
                              <span className="text-xs text-muted-foreground">
                                {g.session}
                                {typeof g._count?.students === "number" &&
                                  ` · ${g._count.students} students`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {batchState.errors?.toGroupId && (
                      <p className="text-xs text-destructive">{batchState.errors.toGroupId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toSemesterId" className="flex items-center gap-1.5 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-violet-500" />
                      To Semester
                    </Label>
                    <Select
                      name="toSemesterId"
                      value={toSemesterId}
                      onValueChange={setToSemesterId}
                    >
                      <SelectTrigger id="toSemesterId" className="h-11">
                        <SelectValue placeholder="Select target semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            Semester {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {batchState.errors?.toSemesterId && (
                      <p className="text-xs text-destructive">{batchState.errors.toSemesterId}</p>
                    )}
                    {toGroup?.currentSemester && (
                      <p className="text-xs text-muted-foreground">
                        Group currently points to Semester {toGroup.currentSemester.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Visual summary */}
              {(fromGroupId || toGroupId) && (
                <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 text-sm dark:border-indigo-800 dark:bg-indigo-950/30">
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                    From
                  </Badge>
                  <span className="font-medium">
                    {fromGroup ? formatGroupLabel(fromGroup) : "—"}
                    {fromSemesterId &&
                      ` · Sem ${semesters.find((s) => String(s.id) === fromSemesterId)?.name ?? "?"}`}
                  </span>
                  <ArrowRight className="h-4 w-4 text-indigo-400" />
                  <Badge className="bg-violet-600 text-white hover:bg-violet-600">To</Badge>
                  <span className="font-medium">
                    {toGroup ? formatGroupLabel(toGroup) : "—"}
                    {toSemesterId &&
                      ` · Sem ${semesters.find((s) => String(s.id) === toSemesterId)?.name ?? "?"}`}
                  </span>
                </div>
              )}

              <ResultBanner state={batchState} />

              {batchState.data?.skipped?.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
                  <p className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    {batchState.data.skipped.length} student(s) skipped
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/80 dark:text-amber-200/80">
                    {batchState.data.skipped.map((s: any) => (
                      <li key={s.studentId}>
                        Student #{s.studentId} — {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {batchState.data?.promotedCount > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
                  <p className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Successfully promoted {batchState.data.promotedCount} student(s)
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <SubmitButton
                  label="Promote Batch"
                  icon={ArrowUpCircle}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Move Single Student ────────────────────────────── */}
      <TabsContent value="single" className="mt-6">
        <Card className="overflow-hidden border-0 shadow-xl shadow-blue-500/5">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-5 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-white">
                  Move a Single Student
                </CardTitle>
                <CardDescription className="mt-1 text-blue-100">
                  Change a student’s semester and/or group. Use for retakes, corrections, or
                  transferring between groups. Session follows the new group.
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="pt-6">
            <form action={singleAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studentSearch" className="flex items-center gap-1.5 font-medium">
                  <Search className="h-3.5 w-3.5 text-blue-500" />
                  Student
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="studentSearch"
                    placeholder="Search by name, roll, or registration..."
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    className="h-11 pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>

                <Select
                  name="studentId"
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {searchResults.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No students found
                      </div>
                    ) : (
                      searchResults.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{s.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatStudentMeta(s)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {singleState.errors?.studentId && (
                  <p className="text-xs text-destructive">{singleState.errors.studentId}</p>
                )}
              </div>

              {selectedStudent && (
                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 px-5 py-4 dark:border-blue-900 dark:from-blue-950/40 dark:to-cyan-950/30">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <UserCheck className="h-3.5 w-3.5" />
                    Current placement
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="text-base font-semibold">{selectedStudent.name}</span>
                    {selectedStudent.currentSemester?.name && (
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Semester {selectedStudent.currentSemester.name}
                      </Badge>
                    )}
                    {selectedStudent.group && (
                      <span className="text-sm text-muted-foreground">
                        {selectedStudent.group.name}
                        {selectedStudent.group.session &&
                          ` · Session ${selectedStudent.group.session}`}
                        {selectedStudent.group.shift?.name &&
                          ` · ${selectedStudent.group.shift.name}`}
                        {selectedStudent.group.department?.shortName &&
                          ` · ${selectedStudent.group.department.shortName}`}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="toSemesterIdSingle" className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    Move To Semester
                  </Label>
                  <Select name="toSemesterId">
                    <SelectTrigger id="toSemesterIdSingle" className="h-11">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          Semester {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toGroupIdSingle" className="flex items-center gap-1.5 font-medium">
                    <Layers className="h-3.5 w-3.5 text-blue-500" />
                    New Group
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Select name="toGroupId">
                    <SelectTrigger id="toGroupIdSingle" className="h-11">
                      <SelectValue placeholder="Keep current group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          <div className="flex flex-col gap-0.5 py-0.5">
                            <span className="font-medium">{formatGroupLabel(g)}</span>
                            <span className="text-xs text-muted-foreground">{g.session}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ResultBanner state={singleState} />

              <div className="flex justify-end pt-2">
                <SubmitButton
                  label="Move Student"
                  icon={UserCog}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Apply Result ─────────────────────────────── */}
      <TabsContent value="result" className="mt-6">
        <Card className="overflow-hidden border-0 shadow-xl shadow-violet-500/5">
          <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 px-6 py-5 text-white">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-white">
                  Apply a Diploma Result
                </CardTitle>
                <CardDescription className="mt-1 text-violet-100">
                  Applies pass/retake logic automatically. 4 or more referred/failed subjects
                  triggers a rollback to that semester.
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="pt-6">
            <form action={resultAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="diplomaResultId" className="flex items-center gap-1.5 font-medium">
                  <FileCheck2 className="h-3.5 w-3.5 text-violet-500" />
                  Diploma Result ID
                </Label>
                <Input
                  id="diplomaResultId"
                  name="diplomaResultId"
                  type="number"
                  placeholder="e.g. 1042"
                  className="h-11 max-w-xs"
                />
                {resultState.errors?.diplomaResultId && (
                  <p className="text-xs text-destructive">
                    {resultState.errors.diplomaResultId}
                  </p>
                )}
              </div>

              <ResultBanner state={resultState} />

              {resultState.data?.action && (
                <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-5 py-4">
                  <span className="text-sm font-medium text-muted-foreground">Outcome:</span>
                  {resultState.data.action === "PASSED" ? (
                    <Badge className="bg-emerald-600 px-3 py-1 text-sm hover:bg-emerald-600">
                      <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="px-3 py-1 text-sm">
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Retaking
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <SubmitButton
                  label="Apply Result"
                  icon={FileCheck2}
                  className="bg-violet-600 text-white hover:bg-violet-700"
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}