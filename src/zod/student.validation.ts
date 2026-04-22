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

const optionalBangladeshMobile = (fieldName: string) =>
  z.string()
    .optional()
    .transform((val) => (val?.trim().length === 0 ? undefined : val?.trim()))
    .refine(
      (val) => !val || bangladeshMobileRegex.test(val),
      `${fieldName} must be a valid Bangladeshi number`
    );

const addressField = (fieldName: string) =>
  z.string()
    .min(5, `${fieldName} must be at least 5 characters`)
    .max(255, `${fieldName} must not exceed 255 characters`)
    .trim();

export const createStudentZodSchema = z.object({
  // Personal info
  name: nameField("Student name"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender must be Male, Female, or Other" }),

  birthDate: z.string()
    .min(1, "Birth date is required")
    .refine((val) => !isNaN(new Date(val).getTime()), "Birth date must be a valid date")
    .refine((val) => new Date(val) <= new Date(), "Birth date cannot be in the future"),

  birthnumber: z.string()
    .optional()
    .transform((val) => (val?.trim().length === 0 ? undefined : val?.trim()))
    .refine(
      (val) => !val || (val.length >= 4 && val.length <= 30),
      "Birth number must be between 4 and 30 characters"
    ),

  nid: z.string()                   // ← optional
    .optional()
    .transform((val) => (val?.trim().length === 0 ? undefined : val?.trim()))
    .refine(
      (val) => !val || (val.length >= 10 && val.length <= 20),
      "NID must be between 10 and 20 characters"
    ),

  mobile: bangladeshMobile("Mobile number"),   // ← required
  fatherMobile: optionalBangladeshMobile("Father mobile"),  // ← optional
  motherMobile: optionalBangladeshMobile("Mother mobile"),  // ← optional

  // Academic info
  roll: z.string().min(1, "Roll is required").max(20, "Roll must not exceed 20 characters").trim(),
  registration: z.string().min(1, "Registration is required").max(30, "Registration must not exceed 30 characters").trim(),
  groupId: z.number({ message: "Group is required" }).int().positive(),
  departmentId: z.number({ message: "Department is required" }).int().positive(),

  // Family info
  fatherName: nameField("Father name"),
  motherName: nameField("Mother name"),

  // Address
  presentAddress: addressField("Present address"),
  permanentAddress: addressField("Permanent address"),

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

export type CreateStudentInput = z.infer<typeof createStudentZodSchema>;