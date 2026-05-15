import { UserRole } from "@/lib/auth-utils";

export interface Department {
  id: number;
  name: string;
  shortName: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: number;
  name: string;
  order: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: number;
  name: string;
  shortName: string;
  departmentId: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: number;
  name: string;
  session: string;
  departmentId: number;
  shiftId: number;
  currentSemesterId: number;
  crStudentId: number | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  currentSemester: Semester;
  shift: Shift;
}

export interface Student {
  id: number;
  userId: number;
  groupId: number;
  departmentId: number;
  name: string;
  email: string;
  roll: string;
  registration: string;
  mobile: string;
  gender: string;
  birthDate: string;
  birthnumber: string;
  nid: string;
  fatherName: string;
  motherName: string;
  fatherMobile: string | null;
  motherMobile: string | null;
  presentAddress: string;
  permanentAddress: string;
  profilePhoto: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;

  department: Department;
  group: Group; // ← Important: No direct "semester", it's inside group
  attendanceRecords: any[]; // TODO: type later
  diplomaResults: any[]; // TODO: type later
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  needPasswordChange: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  profilePhoto?: string;

  admin: any | null;
  teacher: any | null;
  student: Student | null;
}
