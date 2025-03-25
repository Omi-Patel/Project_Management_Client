import axios from 'axios';
import type { LoginInput, UserInput, UserResponse } from '@/schemas/user-schema';

export function getBackendUrl() {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return backendUrl;
}

// Base API URL
const API_BASE_URL = `${getBackendUrl()}/api/v1`;

/**
 * Create a new user.
 * @param userInput - The user input data.
 * @returns The created user response.
 */
export async function createUser(userInput: UserInput): Promise<UserResponse> {
  try {
    const response = await axios.post<UserResponse>(`${API_BASE_URL}/users/create`, userInput, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create user');
  }
}

/**
 * Login a user.
 * @param loginInput - The login input data.
 * @returns The login response containing tokens or user info.
 */
export async function loginUser(loginInput: LoginInput): Promise<{ token: string }> {
  try {
    const response = await axios.post<{ token: string }>(`${API_BASE_URL}/users/login`, loginInput, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to login user');
  }
}

/**
 * Get a list of all users.
 * @returns A list of user responses.
 */
export async function getAllUsers(): Promise<UserResponse[]> {
  try {
    const response = await axios.get<UserResponse[]>(`${API_BASE_URL}/users/list`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get a user by ID.
 * @param id - The ID of the user.
 * @returns The user response.
 */
export async function getUserById(id: string): Promise<UserResponse | null> {
  try {
    const response = await axios.get<UserResponse>(`${API_BASE_URL}/users/get/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user');
  }
}

/**
 * Update an existing user.
 * @param user - The user data to update.
 * @returns The updated user response.
 */
export async function updateUser(user: UserResponse): Promise<UserResponse | null> {
  try {
    const response = await axios.post<UserResponse>(`${API_BASE_URL}/users/update`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error('Failed to update user');
  }
}

/**
 * Delete a user by ID.
 * @param id - The ID of the user to delete.
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/users/delete/${id}`);
  } catch (error) {
    throw new Error('Failed to delete user');
  }
}