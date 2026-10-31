/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { memo, useActionState, useCallback, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { promoteBatch, promoteSingleStudent, applyDiplomaResult } from "@/service/enrollment/enrollment.service";
import { getStudents } from "@/service/student/student.service";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowUpCircle, UserCog, FileCheck2, CheckCircle2, AlertTriangle, Loader2, Users, GraduationCap,
  Search, Building2, Sparkles, ArrowRight, Layers, BookOpen, UserCheck, RefreshCw, type LucideIcon,
} from "lucide-react";

/* ────────────────────────────── Types ────────────────────────────── */

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

const initialState: ActionState = { success: false, message: "", errors: {}, data: null };

interface PromotionsClientProps {
  groups: GroupOption[];
  semesters: SemesterOption[];
  students: StudentOption[];
}

/* ─────────────────────── Theme config & helpers ─────────────────────── */

// Each tab gets its own accent, all from the emerald / teal / gold family
const THEMES = {
  batch: {
    header: "from-[#0B1F1A] via-primary to-emerald-600",
    sub: "text-emerald-100",
    tab: "data-[state=active]:from-primary data-[state=active]:to-emerald-600",
    panel: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 to-card",
    label: "text-emerald-700",
    icon: "text-emerald-500",
    btn: "from-primary to-emerald-600 shadow-primary/30",
    shadow: "shadow-primary/10",
  },
  target: {
    header: "from-amber-600 via-gold to-yellow-500",
    sub: "text-amber-50",
    tab: "",
    panel: "border-gold-soft bg-gradient-to-br from-amber-50/70 to-card",
    label: "text-amber-700",
    icon: "text-gold",
    btn: "",
    shadow: "",
  },
  single: {
    header: "from-teal-800 via-teal-600 to-cyan-600",
    sub: "text-teal-50",
    tab: "data-[state=active]:from-teal-700 data-[state=active]:to-cyan-600",
    panel: "border-teal-200/70 bg-gradient-to-br from-teal-50/70 to-card",
    label: "text-teal-700",
    icon: "text-teal-500",
    btn: "from-teal-700 to-cyan-600 shadow-teal-600/30",
    shadow: "shadow-teal-600/10",
  },
  result: {
    header: "from-amber-600 via-gold to-yellow-500",
    sub: "text-amber-50",
    tab: "data-[state=active]:from-amber-600 data-[state=active]:to-yellow-500",
    panel: "",
    label: "text-amber-700",
    icon: "text-amber-500",
    btn: "from-amber-600 to-yellow-500 shadow-amber-500/30",
    shadow: "shadow-amber-500/10",
  },
} as const;
type ThemeKey = keyof typeof THEMES;

const formatGroupLabel = (g: GroupOption): string =>
  [
    g.currentSemester?.name && `${g.currentSemester.name} Semester`,
    g.name,
    g.shift?.name,
    g.department?.shortName,
  ]
    .filter(Boolean)
    .join(" · ");

const formatStudentMeta = (s: StudentOption): string =>
  [s.roll && `Roll ${s.roll}`, s.registration && `Reg ${s.registration}`].filter(Boolean).join(" · ");

const CONTROL = "h-11 rounded-xl border-border bg-card transition-all duration-200 hover:border-gold-soft focus:ring-4 focus:ring-primary/10";

/* ───────────────────────── Reusable pieces ───────────────────────── */

function SubmitButton({ label, icon: Icon, theme }: { label: string; icon: LucideIcon; theme: ThemeKey }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className={`w-full border-0 bg-gradient-to-br font-semibold tracking-wide text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto ${THEMES[theme].btn}`}
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

const ResultBanner = memo(function ResultBanner({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return (
    <Alert
      variant={state.success ? "default" : "destructive"}
      className={`st-fade ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100" : ""}`}
    >
      {state.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4" />}
      <AlertTitle className="font-semibold">{state.success ? "Success" : "Error"}</AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
});

const FieldError = ({ msg }: { msg?: string }) => (msg ? <p className="text-xs text-destructive">{msg}</p> : null);

function PanelHeader({ theme, icon: Icon, title, description }: { theme: ThemeKey; icon: LucideIcon; title: string; description: string }) {
  const t = THEMES[theme];
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r px-6 py-5 text-white ${t.header}`}>
      {/* decorative orbs */}
      <span className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-gold/20" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-white">{title}</CardTitle>
          <CardDescription className={`mt-1 ${t.sub}`}>{description}</CardDescription>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ htmlFor, icon: Icon, theme, children }: { htmlFor?: string; icon: LucideIcon; theme: ThemeKey; children: ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/70">
      <Icon className={`h-3.5 w-3.5 ${THEMES[theme].icon}`} />
      {children}
    </Label>
  );
}

interface GroupSelectProps {
  name: string;
  label: ReactNode;
  groups: GroupOption[];
  theme: ThemeKey;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
  showCount?: boolean;
}

const GroupSelect = memo(function GroupSelect({ name, label, groups, theme, placeholder, value, onChange, error, showCount }: GroupSelectProps) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name} icon={Building2} theme={theme}>{label}</FieldLabel>
      <Select name={name} value={value} onValueChange={onChange}>
        <SelectTrigger id={name} className={CONTROL}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((g) => (
            <SelectItem key={g.id} value={String(g.id)}>
              <div className="flex flex-col gap-0.5 py-0.5">
                <span className="font-medium">{formatGroupLabel(g)}</span>
                <span className="text-xs text-muted-foreground">
                  {g.session}
                  {showCount && typeof g._count?.students === "number" && ` · ${g._count.students} students`}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError msg={error} />
    </div>
  );
});

interface SemesterSelectProps {
  name: string;
  label: ReactNode;
  semesters: SemesterOption[];
  theme: ThemeKey;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

const SemesterSelect = memo(function SemesterSelect({ name, label, semesters, theme, placeholder, value, onChange, error, hint, icon = GraduationCap }: SemesterSelectProps) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name} icon={icon} theme={theme}>{label}</FieldLabel>
      <Select name={name} value={value} onValueChange={onChange}>
        <SelectTrigger id={name} className={CONTROL}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {semesters.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>Semester {s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError msg={error} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
});

const TAB_BASE =
  "flex items-center gap-2 rounded-xl py-2.5 font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:text-white data-[state=active]:shadow-lg";

const CARD = "st-fade overflow-hidden rounded-3xl border border-border bg-card shadow-xl";

/* ───────────────────────────── Main ───────────────────────────── */

export default function PromotionsClient({ groups, semesters, students }: PromotionsClientProps) {
  const [batchState, batchAction] = useActionState<ActionState, FormData>(promoteBatch, initialState);
  const [singleState, singleAction] = useActionState<ActionState, FormData>(promoteSingleStudent, initialState);
  const [resultState, resultAction] = useActionState<ActionState, FormData>(applyDiplomaResult, initialState);

  const [studentQuery, setStudentQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentOption[]>(() => students.slice(0, 30));
  const [isSearching, startSearch] = useTransition();
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Batch form state
  const [batch, setBatch] = useState({ fromGroup: "", fromSem: "", toGroup: "", toSem: "" });

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

  const groupById = useMemo(() => new Map(groups.map((g) => [String(g.id), g])), [groups]);
  const semesterById = useMemo(() => new Map(semesters.map((s) => [String(s.id), s])), [semesters]);

  const selectedStudent = useMemo(
    () => searchResults.find((s) => String(s.id) === selectedStudentId),
    [searchResults, selectedStudentId]
  );
  const fromGroup = groupById.get(batch.fromGroup);
  const toGroup = groupById.get(batch.toGroup);

  // Picking a group auto-fills its semester
  const handleFromGroup = useCallback(
    (value: string) =>
      setBatch((b) => ({ ...b, fromGroup: value, fromSem: String(groupById.get(value)?.currentSemester?.id ?? "") })),
    [groupById]
  );
  const handleToGroup = useCallback(
    (value: string) =>
      setBatch((b) => ({ ...b, toGroup: value, toSem: String(groupById.get(value)?.currentSemester?.id ?? "") })),
    [groupById]
  );
  const setFromSem = useCallback((v: string) => setBatch((b) => ({ ...b, fromSem: v })), []);
  const setToSem = useCallback((v: string) => setBatch((b) => ({ ...b, toSem: v })), []);

  const semName = (id: string) => semesterById.get(id)?.name ?? "?";

  return (
    <Tabs defaultValue="batch" className="w-full">
      {/* Tabs */}
      <TabsList className="st-fade grid h-auto w-full grid-cols-1 gap-2 rounded-2xl border border-border bg-gradient-to-r from-secondary via-card to-secondary p-1.5 sm:grid-cols-3">
        <TabsTrigger value="batch" className={`${TAB_BASE} ${THEMES.batch.tab}`}>
          <Users className="h-4 w-4" /> Promote Batch
        </TabsTrigger>
        <TabsTrigger value="single" className={`${TAB_BASE} ${THEMES.single.tab}`}>
          <UserCog className="h-4 w-4" /> Move Student
        </TabsTrigger>
        <TabsTrigger value="result" className={`${TAB_BASE} ${THEMES.result.tab}`}>
          <FileCheck2 className="h-4 w-4" /> Apply Result
        </TabsTrigger>
      </TabsList>

      {/* ── Promote Batch ── */}
      <TabsContent value="batch" className="mt-6">
        <Card className={`${CARD} ${THEMES.batch.shadow} gap-0 py-0`}>
          <PanelHeader
            theme="batch"
            icon={ArrowUpCircle}
            title="Promote a Batch"
            description="Move students from one Group + Semester to another Group + Semester. Students already marked RETAKING are skipped."
          />
          <CardContent className="pt-6 pb-6">
            <form action={batchAction} className="space-y-6">
              {/* FROM */}
              <div className={`rounded-2xl border p-5 ${THEMES.batch.panel}`}>
                <p className={`mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${THEMES.batch.label}`}>
                  <BookOpen className="h-4 w-4" /> From
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <GroupSelect
                    name="fromGroupId" label="From Group" theme="batch" groups={groups} showCount
                    placeholder="Select source group" value={batch.fromGroup} onChange={handleFromGroup}
                    error={batchState.errors?.fromGroupId}
                  />
                  <SemesterSelect
                    name="fromSemesterId" label="From Semester" theme="batch" semesters={semesters}
                    placeholder="Select from semester" value={batch.fromSem} onChange={setFromSem}
                    error={batchState.errors?.fromSemesterId}
                    hint={fromGroup?.currentSemester && `Group currently points to Semester ${fromGroup.currentSemester.name}`}
                  />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-11 w-11 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 text-primary ring-1 ring-gold-soft [animation-duration:2s]">
                  <ArrowRight className="h-5 w-5 rotate-90" />
                </div>
              </div>

              {/* TO */}
              <div className={`rounded-2xl border p-5 ${THEMES.target.panel}`}>
                <p className={`mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${THEMES.target.label}`}>
                  <Sparkles className="h-4 w-4" /> To
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <GroupSelect
                    name="toGroupId" label="To Group" theme="target" groups={groups} showCount
                    placeholder="Select target group" value={batch.toGroup} onChange={handleToGroup}
                    error={batchState.errors?.toGroupId}
                  />
                  <SemesterSelect
                    name="toSemesterId" label="To Semester" theme="target" semesters={semesters}
                    placeholder="Select target semester" value={batch.toSem} onChange={setToSem}
                    error={batchState.errors?.toSemesterId}
                    hint={toGroup?.currentSemester && `Group currently points to Semester ${toGroup.currentSemester.name}`}
                  />
                </div>
              </div>

              {/* Summary */}
              {(batch.fromGroup || batch.toGroup) && (
                <div className="st-fade flex flex-wrap items-center justify-center gap-3 rounded-xl border border-dashed border-gold-soft bg-gradient-to-r from-emerald-50/60 via-card to-amber-50/60 px-4 py-3 text-sm">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">From</Badge>
                  <span className="font-medium">
                    {fromGroup ? formatGroupLabel(fromGroup) : "—"}
                    {batch.fromSem && ` · Sem ${semName(batch.fromSem)}`}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gold" />
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:bg-amber-500">To</Badge>
                  <span className="font-medium">
                    {toGroup ? formatGroupLabel(toGroup) : "—"}
                    {batch.toSem && ` · Sem ${semName(batch.toSem)}`}
                  </span>
                </div>
              )}

              <ResultBanner state={batchState} />

              {batchState.data?.skipped?.length > 0 && (
                <div className="st-fade rounded-xl border border-gold-soft bg-amber-50 p-4 text-sm">
                  <p className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    {batchState.data.skipped.length} student(s) skipped
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/80">
                    {batchState.data.skipped.map((s: any) => (
                      <li key={s.studentId}>Student #{s.studentId} — {s.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {batchState.data?.promotedCount > 0 && (
                <div className="st-fade rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <p className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Successfully promoted {batchState.data.promotedCount} student(s)
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <SubmitButton label="Promote Batch" icon={ArrowUpCircle} theme="batch" />
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Move Single Student ── */}
      <TabsContent value="single" className="mt-6">
        <Card className={`${CARD} ${THEMES.single.shadow} gap-0 py-0`}>
          <PanelHeader
            theme="single"
            icon={UserCog}
            title="Move a Single Student"
            description="Change a student’s semester and/or group. Use for retakes, corrections, or transferring between groups. Session follows the new group."
          />
          <CardContent className="pt-6 pb-6">
            <form action={singleAction} className="space-y-6">
              <div className="space-y-2">
                <FieldLabel htmlFor="studentSearch" icon={Search} theme="single">Student</FieldLabel>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-500/70" />
                  <Input
                    id="studentSearch"
                    placeholder="Search by name, roll, or registration..."
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    className={`${CONTROL} pl-9`}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-600" />
                  )}
                </div>

                <Select name="studentId" value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className={CONTROL}>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {searchResults.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">No students found</div>
                    ) : (
                      searchResults.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{s.name}</span>
                            <span className="text-xs text-muted-foreground">{formatStudentMeta(s)}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FieldError msg={singleState.errors?.studentId} />
              </div>

              {selectedStudent && (
                <div className="st-fade rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50 to-cyan-50 px-5 py-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
                    <UserCheck className="h-3.5 w-3.5" /> Current placement
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="text-base font-semibold text-foreground">{selectedStudent.name}</span>
                    {selectedStudent.currentSemester?.name && (
                      <Badge className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white hover:bg-teal-700">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        Semester {selectedStudent.currentSemester.name}
                      </Badge>
                    )}
                    {selectedStudent.group && (
                      <span className="text-sm text-muted-foreground">
                        {[
                          selectedStudent.group.name,
                          selectedStudent.group.session && `Session ${selectedStudent.group.session}`,
                          selectedStudent.group.shift?.name,
                          selectedStudent.group.department?.shortName,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <SemesterSelect
                  name="toSemesterId" label="Move To Semester" theme="single" semesters={semesters}
                  placeholder="Select semester" icon={Sparkles}
                />
                <div className="space-y-2">
                  <FieldLabel htmlFor="toGroupId" icon={Layers} theme="single">
                    New Group <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Select name="toGroupId">
                    <SelectTrigger id="toGroupId" className={CONTROL}>
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
                <SubmitButton label="Move Student" icon={UserCog} theme="single" />
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Apply Result ── */}
      <TabsContent value="result" className="mt-6">
        <Card className={`${CARD} ${THEMES.result.shadow} gap-0 py-0`}>
          <PanelHeader
            theme="result"
            icon={FileCheck2}
            title="Apply a Diploma Result"
            description="Applies pass/retake logic automatically. 4 or more referred/failed subjects triggers a rollback to that semester."
          />
          <CardContent className="pt-6 pb-6">
            <form action={resultAction} className="space-y-6">
              <div className="space-y-2">
                <FieldLabel htmlFor="diplomaResultId" icon={FileCheck2} theme="result">Diploma Result ID</FieldLabel>
                <Input
                  id="diplomaResultId"
                  name="diplomaResultId"
                  type="number"
                  placeholder="e.g. 1042"
                  className={`${CONTROL} max-w-xs`}
                />
                <FieldError msg={resultState.errors?.diplomaResultId} />
              </div>

              <ResultBanner state={resultState} />

              {resultState.data?.action && (
                <div className="st-fade flex items-center gap-3 rounded-2xl border border-gold-soft bg-gradient-to-r from-amber-50/70 to-card px-5 py-4">
                  <span className="text-sm font-medium text-muted-foreground">Outcome:</span>
                  {resultState.data.action === "PASSED" ? (
                    <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1 text-sm hover:bg-emerald-600">
                      <GraduationCap className="mr-1.5 h-3.5 w-3.5" /> Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="px-3 py-1 text-sm">
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retaking
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <SubmitButton label="Apply Result" icon={FileCheck2} theme="result" />
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}