import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// Error response interface matching backend structure
interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
}

// Error categories for better user experience
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  NETWORK = "network",
  SERVER = "server",
  UNKNOWN = "unknown",
}

// Error information structure
export interface ErrorInfo {
  message: string;
  category: ErrorCategory;
  status?: number;
  originalError?: any;
}

/**
 * Extract error information from axios error
 */
export function extractErrorInfo(error: any): ErrorInfo {
  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Check if we have a response with error data
    if (axiosError.response?.data) {
      const errorData = axiosError.response.data as ErrorResponse;
      
      return {
        message: errorData.message || "An error occurred",
        category: getErrorCategory(axiosError.response.status, errorData.message),
        status: axiosError.response.status,
        originalError: error,
      };
    }
    
    // Handle network errors
    if (axiosError.code === "NETWORK_ERROR" || axiosError.code === "ERR_NETWORK") {
      return {
        message: "Network error. Please check your internet connection and try again.",
        category: ErrorCategory.NETWORK,
        originalError: error,
      };
    }
    
    // Handle timeout errors
    if (axiosError.code === "ECONNABORTED") {
      return {
        message: "Request timed out. Please try again.",
        category: ErrorCategory.NETWORK,
        originalError: error,
      };
    }
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
      category: ErrorCategory.UNKNOWN,
      originalError: error,
    };
  }
  
  // Fallback for unknown error types
  return {
    message: "An unexpected error occurred. Please try again.",
    category: ErrorCategory.UNKNOWN,
    originalError: error,
  };
}

/**
 * Determine error category based on status code and message
 */
function getErrorCategory(status: number, message?: string): ErrorCategory {
  switch (status) {
    case 401:
      return ErrorCategory.AUTHENTICATION;
    case 403:
      return ErrorCategory.AUTHORIZATION;
    case 400:
      return ErrorCategory.VALIDATION;
    case 404:
      return ErrorCategory.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorCategory.SERVER;
    default:
      return ErrorCategory.UNKNOWN;
  }
}

/**
 * Get user-friendly error message based on category and original message
 */
export function getUserFriendlyMessage(errorInfo: ErrorInfo): string {
  const { category, message } = errorInfo;
  
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      if (message.includes("verify your email")) {
        return "Please verify your email before logging in. Check your email for the verification code.";
      }
      if (message.includes("Invalid OTP")) {
        return "Invalid verification code. Please check your email and try again.";
      }
      if (message.includes("Invalid refresh token")) {
        return "Your session has expired. Please log in again.";
      }
      return "Authentication failed. Please check your credentials and try again.";
      
    case ErrorCategory.AUTHORIZATION:
      if (message.includes("not allowed")) {
        return "You don't have permission to access this resource.";
      }
      return "Access denied. You don't have the required permissions.";
      
    case ErrorCategory.VALIDATION:
      if (message.includes("Email is required")) {
        return "Email address is required.";
      }
      if (message.includes("not found")) {
        return "The requested resource was not found.";
      }
      if (message.includes("already verified")) {
        return "Your email is already verified.";
      }
      return message || "Please check your input and try again.";
      
    case ErrorCategory.NOT_FOUND:
      return "The requested resource was not found.";
      
    case ErrorCategory.NETWORK:
      return message || "Network error. Please check your connection and try again.";
      
    case ErrorCategory.SERVER:
      return "Server error. Please try again later.";
      
    default:
      return message || "An unexpected error occurred. Please try again.";
  }
}

/**
 * Show error toast with appropriate styling
 */
export function showErrorToast(errorInfo: ErrorInfo): void {
  const message = getUserFriendlyMessage(errorInfo);
  
  // Special case: No refresh token available should show nothing
  if (message.includes("No refresh token available")) {
    return;
  }
  
  switch (errorInfo.category) {
    case ErrorCategory.AUTHENTICATION:
      toast.error("Authentication Error", {
        description: message,
        duration: 5000,
      });
      break;
      
    case ErrorCategory.AUTHORIZATION:
      toast.error("Access Denied", {
        description: message,
        duration: 5000,
      });
      break;
      
    case ErrorCategory.VALIDATION:
      toast.error("Validation Error", {
        description: message,
        duration: 4000,
      });
      break;
      
    case ErrorCategory.NOT_FOUND:
      toast.error("Not Found", {
        description: message,
        duration: 4000,
      });
      break;
      
    case ErrorCategory.NETWORK:
      toast.error("Network Error", {
        description: message,
        duration: 6000,
      });
      break;
      
    case ErrorCategory.SERVER:
      toast.error("Server Error", {
        description: message,
        duration: 5000,
      });
      break;
      
    default:
      toast.error("Error", {
        description: message,
        duration: 4000,
      });
  }
}

/**
 * Handle API errors with automatic toast display
 */
export function handleApiError(error: any): ErrorInfo {
  const errorInfo = extractErrorInfo(error);
  showErrorToast(errorInfo);
  return errorInfo;
}

/**
 * Handle API errors without showing toast (for cases where you want custom handling)
 */
export function handleApiErrorSilent(error: any): ErrorInfo {
  return extractErrorInfo(error);
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: any, category: ErrorCategory): boolean {
  const errorInfo = extractErrorInfo(error);
  return errorInfo.category === category;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: any): boolean {
  return isErrorType(error, ErrorCategory.AUTHENTICATION);
}

/**
 * Check if error is authorization related
 */
export function isAuthzError(error: any): boolean {
  return isErrorType(error, ErrorCategory.AUTHORIZATION);
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: any): boolean {
  return isErrorType(error, ErrorCategory.VALIDATION);
} 