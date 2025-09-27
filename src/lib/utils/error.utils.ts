/**
 * Error handling utilities for the application
 */

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      details?: string;
    };
    status?: number;
  };
  message?: string;
  name?: string;
}

/**
 * Extracts a user-friendly error message from an API error
 * @param error - The error object from API call
 * @param defaultMessage - Default message to show if no specific error message is found
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: ApiError, defaultMessage: string = 'An unexpected error occurred'): string {
  // Try to get message from response data
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Try to get error from response data
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Try to get details from response data
  if (error?.response?.data?.details) {
    return error.response.data.details;
  }
  
  // Try to get message from error object
  if (error?.message) {
    return error.message;
  }
  
  // Return default message
  return defaultMessage;
}

/**
 * Gets the HTTP status code from an error
 * @param error - The error object from API call
 * @returns The HTTP status code or null if not available
 */
export function getErrorStatus(error: ApiError): number | null {
  return error?.response?.status || null;
}

/**
 * Checks if the error is a client error (4xx)
 * @param error - The error object from API call
 * @returns True if the error is a client error
 */
export function isClientError(error: ApiError): boolean {
  const status = getErrorStatus(error);
  return status !== null && status >= 400 && status < 500;
}

/**
 * Checks if the error is a server error (5xx)
 * @param error - The error object from API call
 * @returns True if the error is a server error
 */
export function isServerError(error: ApiError): boolean {
  const status = getErrorStatus(error);
  return status !== null && status >= 500;
}

/**
 * Checks if the error is a network error
 * @param error - The error object from API call
 * @returns True if the error is a network error
 */
export function isNetworkError(error: ApiError): boolean {
  return !error?.response && error?.message !== undefined;
}

/**
 * Gets appropriate error message based on error type
 * @param error - The error object from API call
 * @param context - Context for the error (e.g., 'creating user', 'deleting post')
 * @returns A contextual error message
 */
export function getContextualErrorMessage(error: ApiError, context: string): string {
  if (isNetworkError(error)) {
    return `Network error while ${context}. Please check your connection and try again.`;
  }
  
  if (isServerError(error)) {
    return `Server error while ${context}. Please try again later.`;
  }
  
  const errorMessage = getErrorMessage(error);
  
  // If we have a specific error message, use it
  if (errorMessage !== 'An unexpected error occurred') {
    return errorMessage;
  }
  
  // Otherwise, provide a contextual message
  return `Failed to ${context}. Please try again.`;
}
