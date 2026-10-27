"use client";

import { useMemo, useState } from "react";

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
      <div className="rounded-2xl border bg-white py-20 text-center shadow-sm">
        <p className="text-lg font-medium text-gray-400">No classes found</p>
        <p className="mt-1 text-sm text-gray-400">
          Your group has no routine published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border bg-white p-1 shadow-sm">
          <button
            onClick={() => setViewMode("timetable")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "timetable"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Weekly Timetable
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "cards"
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
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
            className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 font-semibold text-gray-700">Day</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Period</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Time</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Subject</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Teacher</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Room</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutines.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No classes found
                  </td>
                </tr>
              ) : (
                filteredRoutines.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-gray-50/80 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {DAYS[r.dayOfWeek]}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {r.period}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.startTime} – {r.endTime}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-indigo-700">
                        {r.subjectGroup.subject.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {r.subjectGroup.subject.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.subjectGroup.teacher.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.room || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3">
                  <h3 className="font-semibold text-white">{dayName}</h3>
                  <p className="text-xs text-indigo-100">
                    {dayRoutines.length} class
                    {dayRoutines.length > 1 ? "es" : ""}
                  </p>
                </div>

                <div className="divide-y">
                  {dayRoutines.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {r.subjectGroup.subject.shortName ||
                              r.subjectGroup.subject.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {r.subjectGroup.teacher.name}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                          P{r.period}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {r.startTime} – {r.endTime}
                        </span>
                        {r.room && (
                          <>
                            <span>•</span>
                            <span>{r.room}</span>
                          </>
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