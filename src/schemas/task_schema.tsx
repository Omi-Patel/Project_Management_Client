import * as z from "zod";

// Schema for a Task
export const TaskSchema = z.object({
  id: z.string().nullable().optional(), // Task ID is required
  projectId: z.string(), // Project ID is required
  title: z.string().min(1, "Task title is required"), // Title is required with a validation message
  description: z.string().nullable().optional(), // Description is optional and can be null
  status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]).default("TO_DO"), // Status with default value
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"), // Priority with default value
  createdAt: z.number().nullable().optional(), // Created timestamp is required
  updatedAt: z.number().nullable().optional(), // Updated timestamp is required
});

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

// Schema for User Task Request (assigning a task to a user)
export const UserTaskRequestSchema = z.object({
  userId: z.string(), // User ID is required
  taskId: z.string(), // Task ID is required
});

// Types for TypeScript
export type Task = z.infer<typeof TaskSchema>;
export type TaskRequest = z.infer<typeof TaskRequestSchema>;
export type TaskResponse = z.infer<typeof TaskResponseSchema>;
export type UserTaskRequest = z.infer<typeof UserTaskRequestSchema>;
