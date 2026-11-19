import { config } from '../config';
import { HealthResponse, ApiErrorResponse } from '../types/api';
import {
  DatasetDetail,
  SchemaResponse,
  DatasetPreviewResponse,
  DatasetUploadResponse,
} from '../types/dataset';
import { QueryRequest, QueryResponse } from '../types/query';
import { mockAdapter } from './mocks/mockAdapter';

// Mock mode is enabled via VITE_USE_MOCKS=true for development and prototype verification
export const isMockModeActive = config.useMocks;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(options.headers || {});

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorData: ApiErrorResponse | null = null;
        try {
          errorData = await response.json();
        } catch {
          // Response was not JSON
        }

        const message =
          errorData?.error?.message ||
          `API request failed with status ${response.status} (${response.statusText})`;
        const error = new Error(message) as Error & {
          code?: string;
          status?: number;
          requestId?: string;
          details?: unknown;
        };
        error.code = errorData?.error?.code || 'INTERNAL_ERROR';
        error.status = response.status;
        error.requestId = errorData?.error?.request_id;
        error.details = errorData?.error?.details;
        throw error;
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err) {
        throw err;
      }
      const networkError = new Error(
        'Unable to connect to DataTalk AI backend service. Please verify your connection or try again.'
      ) as Error & { code: string; status: number };
      networkError.code = 'NETWORK_ERROR';
      networkError.status = 503;
      throw networkError;
    }
  }

  async health(): Promise<HealthResponse> {
    if (isMockModeActive) return mockAdapter.health();
    return this.request<HealthResponse>('/health');
  }

  async getDatasets(): Promise<DatasetDetail[]> {
    if (isMockModeActive) return mockAdapter.getDatasets();
    return this.request<DatasetDetail[]>('/datasets');
  }

  async getDataset(datasetId: string): Promise<DatasetDetail> {
    if (isMockModeActive) return mockAdapter.getDataset(datasetId);
    return this.request<DatasetDetail>(`/datasets/${encodeURIComponent(datasetId)}`);
  }

  async getSchema(datasetId: string): Promise<SchemaResponse> {
    if (isMockModeActive) return mockAdapter.getSchema(datasetId);
    return this.request<SchemaResponse>(`/datasets/${encodeURIComponent(datasetId)}/schema`);
  }

  async getPreview(
    datasetId: string,
    table?: string,
    limit: number = 10
  ): Promise<DatasetPreviewResponse> {
    if (isMockModeActive) return mockAdapter.getPreview(datasetId, table, limit);
    const params = new URLSearchParams();
    if (table) params.append('table', table);
    if (limit) params.append('limit', String(limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<DatasetPreviewResponse>(
      `/datasets/${encodeURIComponent(datasetId)}/preview${query}`
    );
  }

  async uploadDataset(file: File): Promise<DatasetUploadResponse> {
    if (isMockModeActive) return mockAdapter.uploadDataset(file);
    const formData = new FormData();
    formData.append('file', file);
    return this.request<DatasetUploadResponse>('/datasets', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDataset(datasetId: string): Promise<{ success: boolean }> {
    if (isMockModeActive) return mockAdapter.deleteDataset(datasetId);
    return this.request<{ success: boolean }>(`/datasets/${encodeURIComponent(datasetId)}`, {
      method: 'DELETE',
    });
  }

  async executeQuery(req: QueryRequest): Promise<QueryResponse> {
    if (isMockModeActive) return mockAdapter.executeQuery(req);
    return this.request<QueryResponse>('/queries', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
}

export const api = new ApiClient(config.apiBaseUrl);
