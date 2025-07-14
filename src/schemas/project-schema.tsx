import * as z from 'zod';


// Schema for a complete project (Project equivalent)
export const ProjectSchema = z.object({
  id: z.string().optional().nullable(), // ID is required
  name: z.string().min(1, "Project name is required"), // Name is required with a validation message
  taskIds: z.array(z.string()).optional(), // List of task IDs is optional
  description: z.string().nullable(), // Description can be null
  userId: z.string(),
  workspaceId: z.string().nullable().optional(), // Workspace ID is optional
  color: z.string(),
  startDate: z.string().nullable(), // Start date can be null
  endDate: z.string().nullable(), // End date can be null
  createdAt: z.number().nullable().optional(), // Created timestamp is required
  updatedAt: z.number().nullable().optional(), // Updated timestamp is required
});

// Types for TypeScript

export type ProjectSchema = z.infer<typeof ProjectSchema>;