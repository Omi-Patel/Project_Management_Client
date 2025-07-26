import axios from "axios";
import type {
  LoginInput,
  UserInput,
  UserResponse,
} from "@/schemas/user-schema";
import type { ProjectSchema } from "@/schemas/project-schema";
import type { TaskRequest, TaskResponse } from "@/schemas/task_schema";
import type {
  TAuthResponse,
  TRefreshTokenRequest,
} from "@/schemas/auth-schema";
import type { CommentRequest, CommentResponse, ListCommentsRequest } from "@/schemas/comment-schema";
import { handleApiError } from "./error-handler";

export function getBackendUrl() {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  return backendUrl;
}

// Base API URL
const API_BASE_URL = `${getBackendUrl()}/api/v1`;

export async function createUser(userInput: UserInput): Promise<UserResponse> {
  try {
    const response = await axios.post<UserResponse>(
      `${API_BASE_URL}/auth/register`,
      userInput,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function verifyOtp(email: string, otpCode: string): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otpCode });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function resendOtp(email: string): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/auth/resend-otp`, { email });
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function loginUser(
  loginInput: LoginInput
): Promise<TAuthResponse> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      loginInput,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
}

export const refreshTokenAction = async (
  data: TRefreshTokenRequest
): Promise<TAuthResponse> => {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, data);
  return response.data;
};

export async function getAllUsers(params: {
  page: number;
  size: number;
  search?: string | null;
}): Promise<UserResponse[]> {
  try {
    const response = await axios.post<UserResponse[]>(
      `${API_BASE_URL}/users/list`,
      params
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<UserResponse | null> {
  try {
    const response = await axios.get<UserResponse>(
      `${API_BASE_URL}/users/get/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function updateUser(
  user: UserResponse
): Promise<UserResponse | null> {
  try {
    const response = await axios.post<UserResponse>(
      `${API_BASE_URL}/users/update`,
      user,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/users/delete/${id}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function createProject(
  projectInput: ProjectSchema
): Promise<ProjectSchema> {
  try {
    const response = await axios.post<ProjectSchema>(
      `${API_BASE_URL}/projects/create`,
      projectInput,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function generateAITasksForProject(
  projectId: string
): Promise<{
  project: ProjectSchema;
  generatedTasks: any[];
  message: string;
}> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/generate-ai-tasks/${projectId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getAllProjects(userId: string): Promise<ProjectSchema[]> {
  try {
    const url = userId
      ? `${API_BASE_URL}/projects/list/${userId}`
      : `${API_BASE_URL}/projects/list`;

    const response = await axios.get<ProjectSchema[]>(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getProjectById(
  projectId: string
): Promise<ProjectSchema | null> {
  try {
    const response = await axios.get<ProjectSchema>(
      `${API_BASE_URL}/projects/get/${projectId}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function updateProject(
  project: ProjectSchema
): Promise<ProjectSchema | null> {
  try {
    const response = await axios.post<ProjectSchema>(
      `${API_BASE_URL}/projects/update`,
      project,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/projects/delete/${id}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function createTask(
  taskInput: TaskRequest
): Promise<TaskResponse> {
  try {
    const response = await axios.post<TaskResponse>(
      `${API_BASE_URL}/tasks/create`,
      taskInput,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getAllTasks(params: {
  userId: string;
  page: number;
  size: number;
  search?: string | null;
  statuses?: string[] | null; // Updated to handle an array of statuses
  priorities?: string[] | null; // Added priorities filter
  assigneeIds?: string[] | null;
}): Promise<TaskResponse[]> {
  try {
    const response = await axios.post<TaskResponse[]>(
      `${API_BASE_URL}/tasks/list`,
      params
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getAllTasksByProjectId(params: {
  projectId: string;
  page: number;
  size: number;
  search?: string | null;
}): Promise<TaskResponse[]> {
  try {
    const response = await axios.post<TaskResponse[]>(
      `${API_BASE_URL}/tasks/project/list`,
      params
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getTaskById(id: string): Promise<TaskResponse | null> {
  try {
    const response = await axios.get<TaskResponse>(
      `${API_BASE_URL}/tasks/get/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function updateTask(
  task: TaskRequest
): Promise<TaskResponse | null> {
  try {
    const response = await axios.post<TaskResponse>(
      `${API_BASE_URL}/tasks/update`,
      task,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: string
): Promise<string> {
  try {
    const response = await axios.post<string>(
      `${API_BASE_URL}/tasks/update-status/${taskId}/${newStatus}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/tasks/delete/${id}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getTasksByUserId(userId: string): Promise<string[]> {
  try {
    const response = await axios.get<string[]>(
      `${API_BASE_URL}/tasks/${userId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function assignUsersToTask(
  taskId: string,
  userIds: string[]
): Promise<void> {
  try {
    await axios.post(
      `${API_BASE_URL}/tasks/assign`,
      { taskId, userIds },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// Comment Actions
export async function createComment(
  comment: CommentRequest,
  userId: string
): Promise<CommentResponse> {
  try {
    const response = await axios.post<CommentResponse>(
      `${API_BASE_URL}/task-comments/create?userId=${userId}`,
      comment,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getCommentsForTask(
  request: ListCommentsRequest
): Promise<CommentResponse[]> {
  try {
    const response = await axios.post<CommentResponse[]>(
      `${API_BASE_URL}/task-comments/list`,
      request
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getCommentById(id: string): Promise<CommentResponse | null> {
  try {
    const response = await axios.get<CommentResponse>(
      `${API_BASE_URL}/task-comments/get/${id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function updateComment(
  id: string,
  content: string,
  userId: string
): Promise<CommentResponse | null> {
  try {
    const response = await axios.put<CommentResponse>(
      `${API_BASE_URL}/task-comments/update/${id}?userId=${userId}`,
      content,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleApiError(error);
    throw error;
  }
}

export async function deleteComment(id: string, userId: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/task-comments/delete/${id}?userId=${userId}`);
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function getCommentCount(taskId: string): Promise<number> {
  try {
    const response = await axios.get<number>(
      `${API_BASE_URL}/task-comments/count/${taskId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}
