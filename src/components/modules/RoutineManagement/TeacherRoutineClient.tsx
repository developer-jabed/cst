"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";

type Routine = {
  id: number;
  groupId: number;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subjectGroup: {
    subject: {
      name: string;
      shortName?: string;
      code: string;
    };
    teacher: {
      name: string;
    };
  };
  group: {
    name: string;
    session: string;
  };
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Props {
  routines: Routine[];
}

export default function StudentRoutineClient({ routines }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<"timetable" | "cards">("timetable");

  const filteredRoutines = useMemo(() => {
    if (selectedDay === "all") return routines;
    return routines.filter((r) => r.dayOfWeek === selectedDay);
  }, [routines, selectedDay]);

  const routinesByDay = useMemo(() => {
    const map: Record<number, Routine[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];

    routines.forEach((r) => {
      map[r.dayOfWeek]?.push(r);
    });

    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.period - b.period)
    );

    return map;
  }, [routines]);

  if (routines.length === 0) {
    return (
      <div className="theme-card py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-primary/50 ring-1 ring-gold-soft">
          <CalendarDays size={28} />
        </div>
        <p className="text-lg font-bold text-foreground">No classes found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your group has no routine published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-secondary/50 p-1 ring-1 ring-border">
          <button
            onClick={() => setViewMode("timetable")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              viewMode === "timetable"
                ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Weekly Timetable
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              viewMode === "cards"
                ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/25"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Day Cards
          </button>
        </div>

        {viewMode === "timetable" && (
          <select
            value={selectedDay}
            onChange={(e) =>
              setSelectedDay(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Days</option>
            {DAYS.map((day, i) => (
              <option key={i} value={i}>
                {day}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ========== WEEKLY TIMETABLE VIEW ========== */}
      {viewMode === "timetable" && (
        <div className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Day
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Period
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Time
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Room
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No classes found
                    </td>
                  </tr>
                ) : (
                  filteredRoutines.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-0 transition hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {DAYS[r.dayOfWeek]}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                          {r.period}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {r.startTime} – {r.endTime}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-primary">
                          {r.subjectGroup.subject.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.subjectGroup.subject.code}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {r.subjectGroup.teacher.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.room || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== DAY CARDS VIEW ========== */}
      {viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DAYS.map((dayName, dayIndex) => {
            const dayRoutines = routinesByDay[dayIndex] || [];
            if (dayRoutines.length === 0) return null;

            return (
              <div
                key={dayIndex}
                className="st-row theme-card relative overflow-hidden shadow-[var(--shadow-card)]"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-500" />

                <div className="border-b border-border bg-gradient-to-br from-primary/5 to-emerald-500/5 px-4 py-3">
                  <h3 className="font-bold text-foreground">{dayName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {dayRoutines.length} class
                    {dayRoutines.length > 1 ? "es" : ""}
                  </p>
                </div>

                <div className="divide-y divide-border">
                  {dayRoutines.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 transition hover:bg-secondary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {r.subjectGroup.subject.shortName ||
                              r.subjectGroup.subject.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {r.subjectGroup.teacher.name}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                          P{r.period}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {r.startTime} – {r.endTime}
                        </span>
                        {r.room && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {r.room}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}