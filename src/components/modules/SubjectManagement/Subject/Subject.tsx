/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { getAllDepartments } from "@/service/department/department.service";
import { getAllSemesters } from "@/service/semester/semester.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createSubject } from "@/service/subject/subject.service";

export default function CreateSubjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<any>({
    success: true,
    message: "",
    errors: {},
  });

  const fetchData = async () => {
    if (departments.length > 0 && semesters.length > 0) return;

    setLoading(true);
    try {
      const [deptRes, semRes] = await Promise.all([
        getAllDepartments(),
        getAllSemesters({}),
      ]);

      setDepartments(Array.isArray(deptRes) ? deptRes : deptRes?.data || []);
      setSemesters(Array.isArray(semRes) ? semRes : semRes?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load departments and semesters");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) fetchData();
    else setFormState({ success: true, message: "", errors: {} });
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createSubject({}, formData);

      setFormState(result);

      if (result.success) {
        toast.success(result.message || "Subject created successfully!");
        setIsOpen(false);
        const form = document.getElementById(
          "create-subject-form"
        ) as HTMLFormElement;
        form?.reset();
      } else {
        toast.error(result.message || "Failed to create subject");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-200 px-5 py-2.5 h-auto text-sm font-semibold rounded-xl">
          <Plus className="w-4 h-4" />
          Create Subject
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-slate-200 shadow-2xl">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400" />

        <div className="p-7">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3.5 mb-1">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                  Create New Subject
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-0.5">
                  Fill in the details below to add a new subject
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="create-subject-form"
            action={handleSubmit}
            className="space-y-5"
          >
            {/* Subject Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Subject Name
              </label>
              <Input
                name="name"
                placeholder="Introduction to Programming"
                required
                className="h-11 text-[15px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {/* Short Name + Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Short Name
                </label>
                <Input
                  name="shortName"
                  placeholder="ICS"
                  required
                  className="h-11 text-[15px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Code
                </label>
                <Input
                  name="code"
                  placeholder="CSE101"
                  required
                  className="h-11 text-[15px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 font-mono"
                />
              </div>
            </div>

            {/* Department + Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Department
                </label>
                <Select name="departmentId" required>
                  <SelectTrigger
                    disabled={loading}
                    className="h-11 text-[15px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  >
                    <SelectValue
                      placeholder={loading ? "Loading..." : "Select Department"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Semester
                </label>
                <Select name="semesterId" required>
                  <SelectTrigger
                    disabled={loading}
                    className="h-11 text-[15px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  >
                    <SelectValue
                      placeholder={loading ? "Loading..." : "Select Semester"}
                    />
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

            {/* Credits */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Credits{" "}
                <span className="text-slate-400 font-normal normal-case tracking-normal">
                  (Optional)
                </span>
              </label>
              <Input
                name="credits"
                type="number"
                step="0.5"
                placeholder="3.0"
                className="h-11 text-[15px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {/* Errors */}
            {formState.errors && Object.keys(formState.errors).length > 0 && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3.5 rounded-xl">
                {Object.entries(formState.errors).map(([key, msg]: any) => (
                  <p key={key}>{msg}</p>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex-1 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-[15px] font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || loading}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[15px] font-bold shadow-md shadow-emerald-200"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Subject"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}