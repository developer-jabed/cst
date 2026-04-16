export interface DiplomaResult {
  id: number;
  roll: string;
  semester: string;
  examYear: number;
  instituteName: string;
  status: string;
  regulation?: string;
  gpa1?: number | null;
  gpa2?: number | null;
  gpa3?: number | null;
  overallGpa?: number | null;
  failedSubjects?: string[];
  referredSubjects?: string[];
}

export interface Student {
  id: number;
  name: string;
  roll: string;
  registration?: string;
  gender?: string;
  session?: string;
  profilePhoto?: string;
  diplomaResults?: DiplomaResult[];
}

export interface Group {
  id: number;
  name: string;
  semesterId?: number;
  semester?: {
    id?: number;
    semesterNo?: number;
    departmentId?: number;
    department?: { id: number; name: string; code?: number };
    shiftId?: number;
    shift?: { id: number; name: string };
  };
  students?: Student[];
}

export interface Filters {
  departmentId: string;
  shiftId: string;
  semesterId: string;
  groupId: string;
}

export interface ResultsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSingleResult: any | null;
  groups: Group[];
  groupMeta: { page: number; limit: number; total: number };
  departments: { id: number | string; name: string }[];
  shifts: { id: number | string; name: string }[];
  semesters: { id: number | string; name: string ; semesterNo: string}[];
  page: number;
  roll: string;
  filters: Filters;
}