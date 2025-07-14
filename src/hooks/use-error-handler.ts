import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  handleApiError,
  handleApiErrorSilent,
  isAuthError,
  isAuthzError,
} from "@/lib/error-handler";
import { useNavigate } from "@tanstack/react-router";

interface ErrorHandlerOptions {
  showToast?: boolean;
  onError?: (error: any) => void;
  onAuthError?: () => void;
  onAuthzError?: () => void;
}

/**
 * Custom hook for handling API errors with automatic toast display and navigation
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const navigate = useNavigate();
  const { showToast = true, onError, onAuthError, onAuthzError } = options;

  const handleError = (error: any) => {
    // Log error for debugging
    console.error("API Error:", error);

    // Handle authentication errors
    if (isAuthError(error)) {
      if (onAuthError) {
        onAuthError();
      } else {
        // Default auth error handling
        navigate({ to: "/auth/login" });
      }
      return;
    }

    // Handle authorization errors
    if (isAuthzError(error)) {
      if (onAuthzError) {
        onAuthzError();
      } else {
        // Default authz error handling
        navigate({ to: "/app/dashboard" });
      }
      return;
    }

    // Show toast if enabled
    if (showToast) {
      handleApiError(error);
    } else {
      handleApiErrorSilent(error);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }
  };

  return { handleError };
}

/**
 * Enhanced useMutation with automatic error handling
 */
export function useMutationWithError<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TError, TVariables> &
    ErrorHandlerOptions = {}
) {
  const { handleError } = useErrorHandler(options);

  return useMutation({
    mutationFn,
    ...options,
    onError: (error) => {
      handleError(error);
      options.onError?.(error);
    },
  });
}

/**
 * Enhanced useQuery with automatic error handling
 * Note: useQuery doesn't support onError in the same way as useMutation
 * Use the error property from the returned object to handle errors
 */
export function useQueryWithError<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError> & ErrorHandlerOptions
) {
  const { handleError } = useErrorHandler(options);
  const query = useQuery(options);

  // Handle error if present
  if (query.error) {
    handleError(query.error);
  }

  return query;
}

/**
 * Hook for handling specific error types
 */
export function useErrorTypeHandler() {
  const navigate = useNavigate();

  const handleAuthError = () => {
    navigate({ to: "/auth/login" });
  };

  const handleAuthzError = () => {
    navigate({ to: "/app/dashboard" });
  };

  const handleValidationError = (error: any) => {
    // Validation errors are already handled by the toast system
    console.error("Validation error:", error);
  };

  const handleNetworkError = (error: any) => {
    console.error("Network error:", error);
    // Network errors are already handled by the toast system
  };

  return {
    handleAuthError,
    handleAuthzError,
    handleValidationError,
    handleNetworkError,
  };
}
