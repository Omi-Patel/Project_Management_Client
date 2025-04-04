import { redirect } from "@tanstack/react-router";
import { refreshTokenAction } from "./actions";
import axios from "axios";
import { getBackendUrl } from "./actions";
import type { TAuthResponse, TUserJwtInformation } from "@/schemas/auth-schema";

// Constants for localStorage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "pms-accessToken",
  REFRESH_TOKEN: "pms-refreshToken",
  USER_ID: "pms-userId",
  SUB: "pms-sub",
  EMAIL: "pms-email",
  ROLES: "pms-roles",
  EXP: "pms-exp",
  IAT: "pms-iat",
};

// Create a configured axios instance
export const api = axios.create({
  baseURL: getBackendUrl(),
});

export const authService = {
  // Flag to prevent multiple simultaneous refresh requests
  _refreshingToken: false,

  // Queue of functions waiting for token refresh
  _refreshQueue: [] as Array<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
  }>,

  // Token refresh threshold (refresh at 85% of token lifetime)
  _refreshThreshold: 0.85,

  async setTokens(tokens: TAuthResponse): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);

    // Decode access token and extract user info
    try {
      const payload = this.decodeToken(
        tokens.accessToken
      ) as TUserJwtInformation;
      if (!payload) throw new Error("Failed to decode token");

      // Extract and set user info
      localStorage.setItem(STORAGE_KEYS.USER_ID, payload.userId);
      localStorage.setItem(STORAGE_KEYS.SUB, payload.sub);
      localStorage.setItem(STORAGE_KEYS.EMAIL, payload.email);
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(payload.roles));
      localStorage.setItem(STORAGE_KEYS.EXP, payload.exp.toString());
      if (payload.iat) {
        localStorage.setItem(STORAGE_KEYS.IAT, payload.iat.toString());
      }
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  },

  decodeToken(token: string): TUserJwtInformation | null {
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  isTokenExpired(token: string, useThreshold = false): boolean {
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return true;

      const expiry = payload.exp * 1000; // Convert to milliseconds

      if (useThreshold && payload.iat) {
        // Refresh when token is X% through its lifetime
        const tokenLifetime = expiry - payload.iat * 1000;
        const refreshTime =
          payload.iat * 1000 + tokenLifetime * this._refreshThreshold;
        return Date.now() > refreshTime;
      }

      return Date.now() > expiry;
    } catch {
      return true;
    }
  },

  async refreshToken(): Promise<string> {
    // If already refreshing, wait for that to complete
    if (this._refreshingToken) {
      return new Promise((resolve, reject) => {
        this._refreshQueue.push({ resolve, reject });
      });
    }

    this._refreshingToken = true;

    try {
      const refreshTokenValue = this.getRefreshToken();

      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const newTokens = await refreshTokenAction({
        refreshToken: refreshTokenValue,
      });

      // Update tokens in localStorage
      await this.setTokens(newTokens);

      // Resolve all pending promises
      this._refreshQueue.forEach(({ resolve }) =>
        resolve(newTokens.accessToken)
      );

      return newTokens.accessToken;
    } catch (error) {
      // Reject all pending promises
      this._refreshQueue.forEach(({ reject }) => reject(error));

      console.error("Token refresh failed:", error);
      this.clearTokens();
      throw error;
    } finally {
      this._refreshQueue = [];
      this._refreshingToken = false;
    }
  },

  async getUserDetails(): Promise<TUserJwtInformation | null> {
    // First try to get from localStorage for performance
    const sub = localStorage.getItem(STORAGE_KEYS.SUB);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
    const rolesStr = localStorage.getItem(STORAGE_KEYS.ROLES);
    const exp = localStorage.getItem(STORAGE_KEYS.EXP);
    const iat = localStorage.getItem(STORAGE_KEYS.IAT);

    if (sub && userId && email && rolesStr && exp) {
      return {
        sub,
        userId,
        email,
        roles: JSON.parse(rolesStr),
        exp: parseInt(exp, 10),
        iat: iat ? parseInt(iat, 10) : 0,
      };
    }

    // If not in localStorage, try to get from token
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) return null;

      const payload = this.decodeToken(accessToken);
      return payload;
    } catch (error) {
      console.error("Error getting user details:", error);
      return null;
    }
  },

  async getAccessToken(): Promise<string | null> {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    // If no token or token is completely expired (not just at threshold)
    if (!accessToken || this.isTokenExpired(accessToken, false)) {
      // Try to refresh the token
      try {
        return await this.refreshToken();
      } catch (error) {
        console.error("Error getting access token:", error);
        // If refresh fails, clear tokens and return null
        this.clearTokens();
        return null;
      }
    }

    // If token exists but is approaching expiration, refresh in background
    if (this.isTokenExpired(accessToken, true)) {
      // Don't await - let it refresh in background
      this.refreshToken().catch((error) => {
        console.error("Background token refresh failed:", error);
      });
    }

    return accessToken;
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  clearTokens(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  },

  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      console.error("Error checking if logged in:", error);
      return false;
    }
  },

  async hasRole(role: string): Promise<boolean> {
    const userDetails = await this.getUserDetails();
    if (!userDetails || !userDetails.roles) return false;

    return userDetails.roles.includes(role);
  },

  // Setup axios interceptors for automatic token handling
  setupInterceptors(): typeof api {
    // Request interceptor
    api.interceptors.request.use(
      async (config) => {
        // Skip auth for login and refresh endpoints
        if (
          config.url?.includes("/api/v1/auth/login") ||
          config.url?.includes("/api/v1/auth/refresh-token")
        ) {
          return config;
        }

        try {
          const token = await this.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/api/v1/auth/refresh-token")
        ) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const newToken = await this.refreshToken();

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, redirect to login
            this.clearTokens();
            redirect({ to: "/auth/login" });
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return api;
  },
};

// Export the configured API instance with auth interceptors
export const authenticatedApi = authService.setupInterceptors();
