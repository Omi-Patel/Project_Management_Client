import * as z from "zod";

// Schema for a Task Request (used for creating/updating tasks)
export const TaskRequestSchema = z.object({
  projectId: z.string(), // Project ID is required
  title: z.string().min(1, "Task title is required"), // Title is required
  description: z.string().nullable().optional(), // Description is optional and can be null
  assigneeIds: z.array(z.string()).optional(), // List of assignee IDs is optional
  status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]).default("TO_DO"), // Status with default value
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"), // Priority with default value
});

// Schema for a Task Response (used for API responses)
export const TaskResponseSchema = z.object({
  id: z.string(), // Task ID is required
  projectId: z.string(), // Project ID is required
  title: z.string(), // Title is required
  description: z.string().nullable().optional(), // Description is optional and can be null
  assigneeIds: z.array(z.string()), // List of assignee IDs is required
  status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]), // Status is required
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]), // Priority is required
  createdAt: z.number().nullable().optional(), // Created timestamp is required
  updatedAt: z.number().nullable().optional(), // Updated timestamp is required
});

export const listTaskSchema = z.object({
  page: z.number().min(1, "Page must be at least 1"), // Page number, must be at least 1
  size: z.number().min(1, "Size must be at least 1"), // Page size, must be at least 1
  search: z.string().nullable().optional(), // Optional search string
  userId: z.string().nullable().optional(), // Optional user ID
});

// Types for TypeScript
export type TaskRequest = z.infer<typeof TaskRequestSchema>;
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
export type ListTaskRequest = z.infer<typeof listTaskSchema>;
