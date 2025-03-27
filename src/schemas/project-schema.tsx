import * as z from 'zod';


// Schema for a complete project (Project equivalent)
export const ProjectSchema = z.object({
  id: z.string().optional().nullable(), // ID is required
  name: z.string().min(1, "Project name is required"), // Name is required with a validation message
  description: z.string().nullable(), // Description can be null
  startDate: z.number().nullable(), // Start date can be null
  endDate: z.number().nullable(), // End date can be null
  createdAt: z.number().nullable().optional(), // Created timestamp is required
  updatedAt: z.number().nullable().optional(), // Updated timestamp is required
});

// Types for TypeScript

export type ProjectSchema = z.infer<typeof ProjectSchema>;