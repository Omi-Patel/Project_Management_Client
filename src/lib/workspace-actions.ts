import type {
  WorkspaceCreateSchema,
  WorkspaceUpdateSchema,
  WorkspaceResponseSchema,
  WorkspaceInvitationSchema,
  WorkspaceMemberSchema,
  AcceptInvitationSchema,
  InviteUserSchema,
} from "@/schemas/workspace-schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create workspace
export async function createWorkspace(data: WorkspaceCreateSchema): Promise<WorkspaceResponseSchema> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create workspace");
  }

  return response.json();
}

// Get workspace by ID
export async function getWorkspace(workspaceId: string, userId: string): Promise<WorkspaceResponseSchema> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}?userId=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to get workspace");
  }

  return response.json();
}

// Get workspaces for user
export async function getWorkspacesForUser(userId: string, search?: string): Promise<WorkspaceResponseSchema[]> {
  const url = new URL(`${API_BASE_URL}/api/workspaces`);
  url.searchParams.append("userId", userId);
  if (search) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to get workspaces");
  }

  return response.json();
}

// Get all workspaces (admin function)
export async function getAllWorkspaces(): Promise<WorkspaceResponseSchema[]> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/admin/all`);

  if (!response.ok) {
    throw new Error("Failed to get all workspaces");
  }

  return response.json();
}

// Update workspace
export async function updateWorkspace(
  workspaceId: string,
  data: WorkspaceUpdateSchema,
  userId: string
): Promise<WorkspaceResponseSchema> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}?userId=${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update workspace");
  }

  return response.json();
}

// Delete workspace
export async function deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}?userId=${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete workspace");
  }
}

// Invite user to workspace
export async function inviteUserToWorkspace(data: InviteUserSchema): Promise<WorkspaceInvitationSchema> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${data.workspaceId}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to invite user to workspace");
  }

  return response.json();
}

// Accept invitation
export async function acceptInvitation(data: AcceptInvitationSchema): Promise<WorkspaceResponseSchema> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/invitations/${data.invitationId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to accept invitation");
  }

  return response.json();
}

// Decline invitation
export async function declineInvitation(invitationId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/invitations/${invitationId}/decline?userId=${userId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to decline invitation");
  }
}

// Get pending invitations
export async function getPendingInvitations(email: string): Promise<WorkspaceInvitationSchema[]> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/invitations/pending?email=${email}`);

  if (!response.ok) {
    throw new Error("Failed to get pending invitations");
  }

  return response.json();
}

// Get workspace members
export async function getWorkspaceMembers(workspaceId: string, userId: string): Promise<WorkspaceMemberSchema[]> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/members?userId=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to get workspace members");
  }

  return response.json();
}

// Remove member from workspace
export async function removeMember(workspaceId: string, memberUserId: string, requesterUserId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/workspaces/${workspaceId}/members/${memberUserId}?requesterUserId=${requesterUserId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove member from workspace");
  }
}

// Leave workspace
export async function leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/leave?userId=${userId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to leave workspace");
  }
}

// Get workspace projects
export async function getWorkspaceProjects(workspaceId: string, userId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/projects?userId=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to get workspace projects");
  }

  return response.json();
}

// Get workspace projects for admin (no user authentication required)
export async function getWorkspaceProjectsForAdmin(workspaceId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/admin/${workspaceId}/projects`);

  if (!response.ok) {
    throw new Error("Failed to get workspace projects for admin");
  }

  return response.json();
}

// Get workspace members for admin (no user authentication required)
export async function getWorkspaceMembersForAdmin(workspaceId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/admin/${workspaceId}/members`);

  if (!response.ok) {
    throw new Error("Failed to get workspace members for admin");
  }

  return response.json();
}

// Update member role
export async function updateMemberRole(
  workspaceId: string, 
  memberUserId: string, 
  newRole: string, 
  requesterUserId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/workspaces/${workspaceId}/members/${memberUserId}/role?newRole=${newRole}&requesterUserId=${requesterUserId}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update member role");
  }
}

// Get workspace members for task assignment
export async function getWorkspaceMembersForTasks(workspaceId: string, userId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/workspaces/${workspaceId}/members?userId=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to get workspace members");
  }

  return response.json();
} 