import axios from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static isRateLimit(error: unknown): boolean {
    return (
      error instanceof ApiError &&
      (error.statusCode === 429 || error.code === 'RATE_LIMIT_EXCEEDED')
    );
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      (statusCode === 429
        ? 'Too many requests. Please try again later.'
        : 'An error occurred');
    const code = error.response?.data?.code;

    return new ApiError(message, statusCode, code);
  }

  return new ApiError('An unexpected error occurred', 500);
};
