export type ApiErrorCode =
  | 'INVALID_FILE'
  | 'FILE_TOO_LARGE'
  | 'DATASET_NOT_FOUND'
  | 'DATASET_PROCESSING'
  | 'LLM_NOT_CONFIGURED'
  | 'LLM_PROVIDER_ERROR'
  | 'NOT_ANSWERABLE'
  | 'NEEDS_CLARIFICATION'
  | 'SQL_REJECTED'
  | 'QUERY_TIMEOUT'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR';

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  request_id?: string;
  details?: Record<string, unknown> | null;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  engine?: string;
  memory_free_mb?: number;
}

