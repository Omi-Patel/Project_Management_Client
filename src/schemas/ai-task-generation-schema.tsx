import * as z from "zod";

// Schema for AI Task Generation Request
export const AITaskGenerationRequestSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  
  // Core preferences
  complexity: z.enum(["simple", "balanced", "detailed"]).default("balanced"),
  focusArea: z.enum(["development", "design", "testing", "planning", "all"]).default("all"),
  taskCount: z.number().min(3).max(20).default(8),
  templateStyle: z.enum(["agile", "waterfall", "kanban", "custom"]).default("agile"),
  
  // Advanced options
  includeTimelines: z.boolean().default(true),
  autoAssign: z.boolean().default(false),
  includeSubtasks: z.boolean().default(false),
  includeDependencies: z.boolean().default(false),
  riskAssessment: z.boolean().default(false),
  
  // AI customization
  creativityLevel: z.number().min(0).max(100).default(50), // 0-100%
  detailLevel: z.number().min(20).max(100).default(70),    // 20-100%
  
  // Custom instructions
  customInstructions: z.string().optional(),
  
  // Project context (sent from frontend to avoid backend re-fetch)
  projectContext: z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    teamSize: z.number().optional(),
    technologies: z.array(z.string()).optional(),
    industryType: z.string().optional(),
  }).optional(),
});

// Schema for AI Task Generation Response
export const AITaskGenerationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  generatedTasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]).default("TO_DO"),
    dueDate: z.string().nullable().optional(),
    assigneeIds: z.array(z.string()).default([]),
    dependencies: z.array(z.string()).optional(),
    subtasks: z.array(z.string()).optional(),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    estimatedEffort: z.object({
      hours: z.number().optional(),
      complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    }).optional(),
  })),
  analysis: z.object({
    projectComplexity: z.string(),
    estimatedDuration: z.string(),
    recommendedTeamSize: z.number(),
    riskFactors: z.array(z.string()),
    keyMilestones: z.array(z.string()),
    optimizationSuggestions: z.array(z.string()),
  }).optional(),
  metadata: z.object({
    generationTime: z.number(),
    aiModel: z.string(),
    confidenceScore: z.number().min(0).max(1),
    preferencesUsed: z.object({
      complexity: z.string(),
      focusArea: z.string(),
      taskCount: z.number(),
      creativityLevel: z.number(),
      detailLevel: z.number(),
    }),
  }).optional(),
});

// Types for TypeScript
export type AITaskGenerationRequest = z.infer<typeof AITaskGenerationRequestSchema>;
export type AITaskGenerationResponse = z.infer<typeof AITaskGenerationResponseSchema>;

// Helper function to create default preferences
export const createDefaultAIPreferences = (projectId: string): AITaskGenerationRequest => ({
  projectId,
  complexity: "balanced",
  focusArea: "all",
  taskCount: 8,
  templateStyle: "agile",
  includeTimelines: true,
  autoAssign: false,
  includeSubtasks: false,
  includeDependencies: false,
  riskAssessment: false,
  creativityLevel: 50,
  detailLevel: 70,
}); 