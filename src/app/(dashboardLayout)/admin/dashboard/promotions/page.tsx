// app/admin/dashboard/promotions/page.tsx
import PromotionsClient from "@/components/modules/Admin/promotions/promotions-client";
import { getAllGroups } from "@/service/group/group.service";
import { getAllSemesters } from "@/service/semester/semester.service";
import { getStudents } from "@/service/student/student.service";

export const metadata = {
    title: "Promotions | Admin Dashboard",
    description: "Promote batches or individual students between semesters",
};

export default async function PromotionsPage() {
    const [groupsRes, semestersRes, studentsRes] = await Promise.all([
        getAllGroups({ limit: 500 }),
        getAllSemesters({ limit: 100 }),
        getStudents({ limit: 500 }),
    ]);

    const groups = groupsRes?.success ? groupsRes.data : [];
    const semesters = semestersRes?.success ? semestersRes.data : [];
    const students = studentsRes?.success ? studentsRes.data : [];

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Semester Promotions
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Promote an entire batch to the next semester, move a single student, or apply a
                    diploma result to trigger automatic pass/retake handling.
                </p>
            </div>

            <PromotionsClient groups={groups} semesters={semesters} students={students} />
        </div>
    );
}