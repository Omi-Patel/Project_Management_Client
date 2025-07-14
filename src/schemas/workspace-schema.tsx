import * as z from 'zod';

// Schema for creating a workspace
export const WorkspaceCreateSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  description: z.string().nullable().optional(),
  ownerId: z.string(),
});

// Schema for updating a workspace
export const WorkspaceUpdateSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  description: z.string().nullable().optional(),
  ownerId: z.string(),
});

// Schema for workspace response
export const WorkspaceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  ownerId: z.string(),
  memberCount: z.number(),
  projectCount: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Schema for workspace invitation
export const WorkspaceInvitationSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  workspaceName: z.string(),
  invitedEmail: z.string().email(),
  invitedBy: z.string(),
  inviterName: z.string(),
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED"]),
  expiresAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Schema for workspace member
export const WorkspaceMemberSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
  joinedAt: z.number(),
  updatedAt: z.number(),
});

// Schema for accepting invitation
export const AcceptInvitationSchema = z.object({
  invitationId: z.string(),
  userId: z.string(),
});

// Schema for inviting user to workspace
export const InviteUserSchema = z.object({
  workspaceId: z.string(),
  invitedEmail: z.string().email("Invalid email address"),
  invitedBy: z.string(),
});

// Types for TypeScript
export type WorkspaceCreateSchema = z.infer<typeof WorkspaceCreateSchema>;
export type WorkspaceUpdateSchema = z.infer<typeof WorkspaceUpdateSchema>;
export type WorkspaceResponseSchema = z.infer<typeof WorkspaceResponseSchema>;
export type WorkspaceInvitationSchema = z.infer<typeof WorkspaceInvitationSchema>;
export type WorkspaceMemberSchema = z.infer<typeof WorkspaceMemberSchema>;
export type AcceptInvitationSchema = z.infer<typeof AcceptInvitationSchema>;
export type InviteUserSchema = z.infer<typeof InviteUserSchema>; 