import {  NavSection } from "@/types/dashboard.interface";
import { getDefaultDashboardRoute, UserRole } from "./auth-utils";

export const getCommonNavItems = (role: UserRole): NavSection[] => {
    const defaultDashboard = getDefaultDashboardRoute(role);
    return [
        {
            items: [
                { title: "Home",       href: "/",              icon: "Home",            roles: ["STUDENT", "CR", "TEACHER", "ADMIN"] },
                { title: "Dashboard",  href: defaultDashboard, icon: "LayoutDashboard", roles: ["STUDENT", "CR", "TEACHER", "ADMIN"] },
                { title: "My Profile", href: "/my-profile",    icon: "User",            roles: ["STUDENT", "CR", "TEACHER", "ADMIN"] },
            ],
        },
        {
            title: "Settings",
            items: [
                { title: "Change Password", href: "/change-password", icon: "Settings", roles: ["STUDENT", "CR", "TEACHER", "ADMIN"] },
            ],
        },
    ];
};


export const studentNavItems: NavSection[] = [
    {
        title: "Student Management",
        items: [
            { title: "Notes",   href: "/dashboard/student/notes",   icon: "NotebookPen", roles: ["STUDENT", "CR", "TEACHER"] },
            { title: "Routine", href: "/dashboard/student/routine", icon: "BookOpen",    roles: ["STUDENT", "CR", "TEACHER"] },
            { title: "Tasks",   href: "/dashboard/student/tasks",   icon: "ListChecks",  roles: ["STUDENT", "CR", "TEACHER"] },
        ],
    },
    {
        title: "Institute Management",
        items: [
            { title: "Notice",   href: "/dashboard/student/notice",   icon: "Bell",                 roles: ["STUDENT", "CR", "TEACHER"] },
            { title: "Events",   href: "/dashboard/student/events",   icon: "CalendarDays",         roles: ["STUDENT", "CR", "TEACHER"] },
        ],
    },
    {
        title: "Progress Tracking",
        items: [
            { title: "Attendance", href: "/dashboard/student/attendance", icon: "CheckSquare", roles: ["CR"] },
            { title: "Results",    href: "/dashboard/student/results",    icon: "BarChart",    roles: ["STUDENT", "CR"] },
            { title: "Overview",   href: "/dashboard/student/overview",   icon: "Gauge",       roles: ["STUDENT", "CR"] },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// CR extras
// ─────────────────────────────────────────────────────────────────────────────
export const crNavItems: NavSection[] = [
    {
        title: "CR Management",
        items: [
            { title: "Manage Notes",   href: "/dashboard/cr/manage-notes",   icon: "FilePen",       roles: ["CR"] },
            { title: "Manage Routine", href: "/dashboard/cr/manage-routine", icon: "CalendarClock", roles: ["CR"] },
            { title: "Announcements",  href: "/dashboard/cr/announcements",  icon: "Megaphone",     roles: ["CR"] },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Teacher
// ─────────────────────────────────────────────────────────────────────────────
export const teacherNavItems: NavSection[] = [
    {
        title: "Class Management",
        items: [
            { title: "Practicals & Jobs", href: "/teacher/dashboard/assignments", icon: "ClipboardList", roles: ["TEACHER"] },
            { title: "Routine",     href: "/teacher/dashboard/routine",     icon: "BookOpen",      roles: ["TEACHER"] },
        ],
    },
    {
        title: "Student Oversight",
        items: [
            { title: "Attendance",      href: "/teacher/dashboard/attendence",      icon: "CheckSquare", roles: ["TEACHER"] },
            { title: "Student Reports", href: "/teache/dashboardr/student-reports", icon: "FileText",    roles: ["TEACHER"] },
        ],
    },
    {
        title: "Communication",
        items: [
            { title: "Notice Board", href: "/teacher/dashboard/notice", icon: "Bell",         roles: ["TEACHER"] },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────────────────────
export const adminNavItems: NavSection[] = [
    {
        title: "User Management",
        items: [
            { title: "Teachers", href: "/admin/dashboard/teachers", icon: "UserCheck", roles: ["ADMIN"] },
            { title: "Students", href: "/admin/dashboard/students", icon: "Users",     roles: ["ADMIN"] },
        ],
    },
    {
        title: "Institute Management",
        items: [
            { title: "subjects", href: "/admin/dashboard/classes",  icon: "School",        roles: ["ADMIN"] },
            { title: "assigned subjects", href: "/admin/dashboard/subjects",  icon: "School",        roles: ["ADMIN"] },
            { title: "Routines",           href: "/admin/dashboard/routines", icon: "CalendarDays",  roles: ["ADMIN"] },
            { title: "Events",             href: "/admin/dashboard/events",   icon: "CalendarCheck", roles: ["ADMIN"] },
            { title: "Notice Board",       href: "/admin/dashboard/notice",   icon: "Bell",          roles: ["ADMIN"] },
        ],
    },
    {
        title: "Reports & Analytics",
        items: [
            { title: "Attendance Reports", href: "/admin/dashboard/attendance-reports", icon: "CheckSquare", roles: ["ADMIN"] },
            { title: "Group Overview", href: "/admin/dashboard/group-overview", icon: "Overview", roles: ["ADMIN"] },
            { title: "Exam Results",       href: "/admin/dashboard/results",            icon: "BarChart",    roles: ["ADMIN"] },
            
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role resolver
// ─────────────────────────────────────────────────────────────────────────────
export const getNavItemsByRole = (role: UserRole): NavSection[] => {
    const common = getCommonNavItems(role);
    switch (role) {
        case "ADMIN":   return [...common, ...adminNavItems];
        case "TEACHER": return [...common, ...teacherNavItems];
        case "CR":      return [...common, ...studentNavItems, ...crNavItems];
        case "STUDENT": return [...common, ...studentNavItems];
        default:        return common;
    }
};