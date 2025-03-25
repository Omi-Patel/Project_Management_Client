import * as z from 'zod';

// Schema for UserInput
export const UserInputSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional().default("ACTIVE"),
});

// Schema for UserResponse
export const UserResponseSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).nullable().optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});

// Schema for LoginInput
export const LoginInputSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  });

// TypeScript types inferred from schemas
export type UserInput = z.infer<typeof UserInputSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;