export type ApiSuccessResponse<T> = { data: T; message?: string };
export type ApiErrorResponse = { error: string; code?: string };
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
