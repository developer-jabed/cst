/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getMyRoutines } from "@/service/routine/routine.service";
import TeacherRoutineClient from "@/components/modules/RoutineManagement/TeacherRoutineClient";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyRoutinePage() {
  const [user, routinesRes] = await Promise.all([
    getUserInfo(),
    getMyRoutines(),
  ]);

  const role = user?.role; // "TEACHER" | "STUDENT"
  const routines = routinesRes?.success ? routinesRes.data || [] : [];

  return (
    <div className="theme-content min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="st-fade flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 bg-gradient-to-r from-primary to-gold bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent">
              Dashboard / Routine
            </p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {role === "TEACHER" ? "My Teaching Routine" : "My Class Routine"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {role === "TEACHER"
                ? "Weekly class schedule across all assigned groups"
                : "Your weekly class schedule"}
            </p>
          </div>

          <div className="theme-card flex items-center gap-3 px-4 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <CalendarDays size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Classes
              </p>
              <p className="text-xl font-black leading-none tabular-nums text-foreground">
                {routines.length}
              </p>
            </div>
          </div>
        </div>

        <TeacherRoutineClient routines={routines} />
      </div>
    </div>
  );
}