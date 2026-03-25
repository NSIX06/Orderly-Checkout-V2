export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export function ok<T>(data: T, message: string): ApiSuccess<T> {
  return { success: true, message, data };
}

export function fail(
  message: string,
  code: keyof typeof ERROR_CODES,
  details?: string
): ApiError {
  return {
    success: false,
    message,
    error: { code: ERROR_CODES[code], ...(details ? { details } : {}) },
  };
}