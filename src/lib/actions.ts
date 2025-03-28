import axios from "axios";
import type {
  LoginInput,
  UserInput,
  UserResponse,
} from "@/schemas/user-schema";
import type { ProjectSchema } from "@/schemas/project-schema";
import type { TaskRequest, TaskResponse } from "@/schemas/task_schema";

export function getBackendUrl() {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  return backendUrl;
}

// Base API URL
const API_BASE_URL = `${getBackendUrl()}/api/v1`;

export async function createUser(userInput: UserInput): Promise<UserResponse> {
  try {
    const response = await axios.post<UserResponse>(
      `${API_BASE_URL}/users/create`,
      userInput,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to create user");
  }
}

export async function loginUser(
  loginInput: LoginInput
): Promise<{ token: string }> {
  try {
    const response = await axios.post<{ token: string }>(
      `${API_BASE_URL}/users/login`,
      loginInput,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to login user");
  }
}

export async function getAllUsers(): Promise<UserResponse[]> {
  try {
    const response = await axios.get<UserResponse[]>(
      `${API_BASE_URL}/users/list`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch users");
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
    throw new Error("Failed to fetch user");
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
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/users/delete/${id}`);
  } catch (error) {
    throw new Error("Failed to delete user");
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
    throw new Error("Failed to create project");
  }
}

export async function getAllProjects(userId: string): Promise<ProjectSchema[]> {
  try {
    const response = await axios.get<ProjectSchema[]>(
      `${API_BASE_URL}/projects/list/${userId}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch projects");
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
    throw new Error("Failed to fetch project");
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
    throw new Error("Failed to update project");
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/projects/delete/${id}`);
  } catch (error) {
    throw new Error("Failed to delete project");
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
    throw new Error("Failed to create task");
  }
}

export async function getAllTasks(): Promise<TaskResponse[]> {
  try {
    const response = await axios.get<TaskResponse[]>(
      `${API_BASE_URL}/tasks/list`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch tasks");
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
    throw new Error("Failed to fetch task");
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
    throw new Error("Failed to update task");
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/tasks/delete/${id}`);
  } catch (error) {
    throw new Error("Failed to delete task");
  }
}

export async function getTasksByUserId(userId: string): Promise<string[]> {
  try {
    const response = await axios.get<string[]>(
      `${API_BASE_URL}/tasks/${userId}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch tasks for user");
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
    throw new Error("Failed to assign users to task");
  }
}
