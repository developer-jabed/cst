import { z } from "zod";

const bangladeshMobileRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

const nameField = (fieldName: string) =>
  z.string()
    .min(2, `${fieldName} must be at least 2 characters`)
    .max(100, `${fieldName} must not exceed 100 characters`)
    .trim();

const bangladeshMobile = (fieldName: string) =>
  z.string()
    .regex(bangladeshMobileRegex, `${fieldName} must be a valid Bangladeshi number`);

export const createTeacherZodSchema = z.object({
  // Personal info
  name: nameField("Teacher name"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  mobile: bangladeshMobile("Mobile number"),
  designation: z.string()
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must not exceed 100 characters")
    .trim(),

  // Academic info
  departmentId: z.number({ message: "Department is required" }).int().positive(),

  // Credentials
  password: z.string()
    .min(1, "Password is required")
    .max(50, "Password is too long"),

  // Profile photo
  profilePhoto: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 2 * 1024 * 1024,
      "Profile photo must be less than 2MB"
    ),
});

export type CreateTeacherInput = z.infer<typeof createTeacherZodSchema>;