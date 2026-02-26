export interface ApiError {
  detail: string;
  status_code: number;
  path?: string;
  errors?: Array<{ loc: string[]; msg: string; type: string }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
