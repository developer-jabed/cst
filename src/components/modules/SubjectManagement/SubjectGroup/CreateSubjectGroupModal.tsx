/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { getAllGroups } from "@/service/group/group.service";
import { getAllSemesters } from "@/service/semester/semester.service";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAllTeachers } from "@/service/admin/teacherManagement";
import { createSubjectGroup } from "@/service/auth/subject/subjectGroup.service";
import { getSubjects } from "@/service/auth/subject/subject.service";

export default function CreateSubjectGroupModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);

    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);

    const [formState, setFormState] = useState<any>({
        success: true,
        message: "",
        errors: {},
    });

    // Fetch all required data when modal opens
    const fetchData = async () => {
        if (teachers.length > 0 && subjects.length > 0 && groups.length > 0 && semesters.length > 0) {
            return;
        }

        setLoading(true);
        try {
            const [teachersRes, subjectsRes, groupsRes, semestersRes] = await Promise.all([
                getAllTeachers?.() || [],
                getSubjects?.() || [],           // If you have this service
                getAllGroups?.({}) || [],
                getAllSemesters?.({}) || [],
            ]);

            setTeachers(Array.isArray(teachersRes) ? teachersRes : teachersRes?.data || []);
            setSubjects(Array.isArray(subjectsRes) ? subjectsRes : subjectsRes?.data || []);
            setGroups(Array.isArray(groupsRes) ? groupsRes : groupsRes?.data || []);
            console.log(groupsRes)
            setSemesters(Array.isArray(semestersRes) ? semestersRes : semestersRes?.data || []);
        } catch (error) {
            console.error("Failed to load data for subject group:", error);
            toast.error("Failed to load required data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchData();
        } else {
            setFormState({ success: true, message: "", errors: {} });
        }
    };

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await createSubjectGroup({}, formData);

            setFormState(result);

            if (result.success) {
                toast.success(result.message || "Subject Group created successfully!");
                setIsOpen(false);
                const form = document.getElementById("create-subject-group-form") as HTMLFormElement;
                form?.reset();
            } else {
                toast.error(result.message || "Failed to create subject group");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-5 h-5" />
                    Assign Subject to Group
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Subject Group Assignment</DialogTitle>
                    <DialogDescription>
                        Assign a subject to a specific teacher, group, and semester.
                    </DialogDescription>
                </DialogHeader>

                <form
                    id="create-subject-group-form"
                    action={handleSubmit}
                    className="space-y-5"
                >
                    {/* Teacher */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Teacher</label>
                        <Select name="teacherId" required>
                            <SelectTrigger disabled={loading}>
                                <SelectValue placeholder={loading ? "Loading teachers..." : "Select Teacher"} />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map((teacher: any) => (
                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                        {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Select name="subjectId" required>
                            <SelectTrigger disabled={loading}>
                                <SelectValue placeholder={loading ? "Loading subjects..." : "Select Subject"} />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject: any) => (
                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                        {subject.name} ({subject.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Group & Semester */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Group</label>
                            <Select name="groupId" required>
                                <SelectTrigger disabled={loading}>
                                    <SelectValue placeholder={loading ? "Loading..." : "Select Group"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.map((group: any) => (
                                        <SelectItem key={group.id} value={group.id.toString()}>
                                          {group.shift?.name || ""}  {group.name} {group.currentSemester?.name || ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Semester</label>
                            <Select name="semesterId" required>
                                <SelectTrigger disabled={loading}>
                                    <SelectValue placeholder={loading ? "Loading..." : "Select Semester"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.map((sem: any) => (
                                        <SelectItem key={sem.id} value={sem.id.toString()}>
                                            {sem.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {formState.errors && Object.keys(formState.errors).length > 0 && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                            {Object.entries(formState.errors).map(([key, msg]: any) => (
                                <p key={key}>{msg}</p>
                            ))}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || loading}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Assignment...
                                </>
                            ) : (
                                "Create Subject Group"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}