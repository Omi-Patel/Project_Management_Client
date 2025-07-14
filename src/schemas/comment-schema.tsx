import * as z from "zod";

// Schema for a Comment Request (used for creating comments)
export const CommentRequestSchema = z.object({
  taskId: z.string(),
  content: z.string().min(1, "Comment content is required").max(1000, "Comment is too long"),
});

// Schema for a Comment Response (used for API responses)
export const CommentResponseSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  userName: z.string(),
  content: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Schema for listing comments
export const ListCommentsSchema = z.object({
  taskId: z.string(),
  page: z.number().min(1, "Page must be at least 1").optional().default(1),
  size: z.number().min(1, "Size must be at least 1").max(100, "Size must be at most 100").optional().default(20),
});

export type CommentRequest = z.infer<typeof CommentRequestSchema>;
export type CommentResponse = z.infer<typeof CommentResponseSchema>;
export type ListCommentsRequest = z.infer<typeof ListCommentsSchema>; 