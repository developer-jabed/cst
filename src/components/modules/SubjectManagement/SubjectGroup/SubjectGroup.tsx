/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";



import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CreateSubjectGroupModal from "./CreateSubjectGroupModal";


interface SubjectGroup {
    id: number;
    subject?: { name: string; code: string };
    teacher?: { name: string };
    group?: { name: string };
    semester?: { name: string };
}

interface SubjectGroupsTablePageProps {
    subjectGroups: SubjectGroup[];
    departments: any[];
    semesters: any[];
    groups: any[];
    teachers: any[];
    totalPages: number;
    currentPage: number;
}

export default function SubjectGroupsTablePage({
    subjectGroups,
   
}: SubjectGroupsTablePageProps) {




    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subject Groups</h1>
                    <p className="text-muted-foreground">Manage subject assignments to groups</p>
                </div>
                <CreateSubjectGroupModal />
            </div>

           

            {/* Table */}
            <div className="border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Semester</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjectGroups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-72 text-center text-muted-foreground">
                                    No subject groups found for the selected filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subjectGroups.map((sg: any) => (
                                <TableRow key={sg.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{sg.subject?.name}</TableCell>
                                    <TableCell className="font-mono">{sg.subject?.code}</TableCell>
                                    <TableCell>{sg.teacher?.name}</TableCell>
                                    <TableCell>{sg.group?.name}</TableCell>
                                    <TableCell>{sg.semester?.name}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

          
        
        </div>
    );
}