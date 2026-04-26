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
import { createSubject } from "@/service/auth/subject/subject.service";

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
        const form = document.getElementById("create-subject-form") as HTMLFormElement;
        form?.reset();
      } else {
        toast.error(result.message || "Failed to create subject");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-5 h-5" />
          Create Subject
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Subject</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new subject.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-subject-form"
          action={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject Name</label>
            <Input name="name" placeholder="Introduction to Programming" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Short Name</label>
              <Input name="shortName" placeholder="ICS" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Code</label>
              <Input name="code" placeholder="CSE101" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select name="departmentId" required>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder={loading ? "Loading..." : "Select Department"} />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Credits (Optional)</label>
            <Input name="credits" type="number" step="0.5" placeholder="3.0" />
          </div>

          {formState.errors && Object.keys(formState.errors).length > 0 && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {Object.entries(formState.errors).map(([key, msg]: any) => (
                <p key={key}>{msg}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || loading}>
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
      </DialogContent>
    </Dialog>
  );
}