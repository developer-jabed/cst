/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserInfo } from "@/service/auth/getUserInfo";
import { getMyRoutines } from "@/service/routine/routine.service";
import TeacherRoutineClient from "@/components/modules/RoutineManagement/TeacherRoutineClient";

export const dynamic = "force-dynamic";

export default async function MyRoutinePage() {
    const [user, routinesRes] = await Promise.all([
        getUserInfo(),
        getMyRoutines(),
    ]);

    const role = user?.role; // "TEACHER" | "STUDENT"
    const routines = routinesRes?.success ? routinesRes.data || [] : [];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {role === "TEACHER" ? "My Teaching Routine" : "My Class Routine"}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {role === "TEACHER"
                            ? "Weekly class schedule across all assigned groups"
                            : "Your weekly class schedule"}
                    </p>
                </div>
            </div>

            <TeacherRoutineClient
                routines={routines}
            />
        </div>
    );
}