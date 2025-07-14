import * as z from "zod";

// Schema for UserInput
export const UserInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: z
    .string()
    .optional()
    .nullable()
    .refine(
      (value) => !value || /^\d{10}$/.test(value),
      "Phone Number must be exactly 10 digits!"
    ),
  status: z
    .enum(["ACTIVE", "INACTIVE", "PENDING"])
    .optional()
    .default("ACTIVE"),
});

// Schema for UserResponse
export const UserResponseSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable().optional(),
  role: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).nullable().optional(),
  emailVerified: z.boolean().nullable().optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

// Schema for LoginInput
export const LoginInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const listUserSchema = z.object({
  page: z.number().min(1, "Page must be at least 1"), // Page number, must be at least 1
  size: z.number().min(1, "Size must be at least 1"), // Page size, must be at least 1
  search: z.string().nullable().optional(), // Optional search string
});

// TypeScript types inferred from schemas
export type UserInput = z.infer<typeof UserInputSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type ListUserRequest = z.infer<typeof listUserSchema>;
