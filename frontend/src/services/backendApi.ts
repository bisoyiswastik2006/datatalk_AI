import {
    DatasetDetail,
    SchemaResponse,
    DatasetPreviewResponse,
    DatasetUploadResponse,
} from '../types/dataset';

import { QueryRequest, QueryResponse } from '../types/query';

export const API_BASE_URL = "http://127.0.0.1:8000";

interface HealthResponse {
    success: boolean;
    message: string;
}

// Backend query response format
interface BackendQueryResponse {
    status: string;
    message?: string;
    answer?: string;
    query_id?: string;
    dataset_id?: string;
    question?: string;
    sql?: string | null;
    columns?: string[];
    rows?: Record<string, unknown>[] | unknown[][];
    row_count?: number;
    warnings?: string[];
    chart?: QueryResponse['chart'];
    stage?: string;
}

// Backend AI Insights response format
export interface BackendInsightsResponse {
    success: boolean;
    dataset_name: string;
    row_count: number;
    numeric_columns: string[];
    categorical_columns: string[];
    findings: {
        id: string;
        category: string;
        title: string;
        impact: string;
        confidence: string;
        type: string;
        summary: string;
        recommendation: string;
    }[];
    trend: {
        columns: string[];
        rows: (string | number | null)[][];
        chartHint: {
            type: 'line';
            x: string;
            y: string;
            title: string;
        };
    } | null;
    correlations: {
        metricA: string;
        metricB: string;
        score: string;
        strength: string;
        color: string;
    }[];
    outliers: {
        id: string;
        metric: string;
        value: string;
        normalRange: string;
        score: string;
        status: string;
    }[];
}

// Backend What-If Simulator response format
export interface BackendWhatIfResponse {
    success: boolean;
    dataset_name: string;

    baseline: {
        revenue: number;
        orders: number;
        average_order_value: number;
    };

    simulation: {
        revenue: number;
        orders: number;
        average_order_value: number;
        revenue_change: number;
        revenue_change_pct: number;
        orders_change_pct: number;
    };

    scenario: {
        price_change: number;
        discount_cap: number;
        ad_spend: number;
        churn_delta: number;
    };

    chart: {
        columns: string[];
        rows: (string | number | null)[][];
        chartHint: {
            type: 'line';
            x: string;
            y: string;
            title: string;
        };
    };

    assessment: {
        risk_level: string;
        summary: string;
    };

    assumptions: string[];

    unsupported_metrics: string[];
}
// Common request handler
async function backendRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        let message = `Request failed: ${response.status}`;

        try {
            const errorData = await response.json();
            message = errorData.detail || errorData.message || message;
        } catch {
            // Keep default error message
        }

        throw new Error(message);
    }

    return response.json() as Promise<T>;
}

// Check backend connection
export async function checkBackendConnection(): Promise<HealthResponse> {
    try {
        return await backendRequest<HealthResponse>('/health');
    } catch (error) {
        console.error('Backend Error:', error);

        return {
            success: false,
            message: 'Unable to connect to DataTalk AI backend.',
        };
    }
}

// Upload CSV or Excel dataset
export async function uploadDataset(
    file: File
): Promise<DatasetUploadResponse> {

    const formData = new FormData();
    formData.append('file', file);

    return backendRequest<DatasetUploadResponse>('/datasets', {
        method: 'POST',
        body: formData,
    });
}

// Get all uploaded datasets
export async function getBackendDatasets(): Promise<DatasetDetail[]> {
    return backendRequest<DatasetDetail[]>('/datasets');
}

// Get details of one dataset
export async function getBackendDataset(
    datasetId: string
): Promise<DatasetDetail> {
    return backendRequest<DatasetDetail>(
        `/datasets/${encodeURIComponent(datasetId)}`
    );
}
export async function deleteBackendDataset(
    datasetId: string
): Promise<{ success: boolean; message: string }> {
    return backendRequest<{ success: boolean; message: string }>(
        `/datasets/${datasetId}`,
        {
            method: "DELETE",
        }
    );
}

// Get dataset schema
export async function getBackendSchema(
    datasetId: string
): Promise<SchemaResponse> {
    return backendRequest<SchemaResponse>(
        `/datasets/${encodeURIComponent(datasetId)}/schema`
    );
}

// Get dataset preview
export async function getBackendPreview(
    datasetId: string,
    table?: string,
    limit: number = 10
): Promise<DatasetPreviewResponse> {

    const params = new URLSearchParams();

    if (table) params.append('table', table);

    params.append('limit', String(limit));

    return backendRequest<DatasetPreviewResponse>(
        `/datasets/${encodeURIComponent(datasetId)}/preview?${params.toString()}`
    );
}

// Execute real AI-generated SQL query
export async function executeBackendQuery(
    request: QueryRequest
): Promise<QueryResponse> {

    const backendResponse = await backendRequest<BackendQueryResponse>(
        '/queries',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dataset_id: request.dataset_id,
                question: request.question,
            }),
        }
    );

    const columns = backendResponse.columns || [];

    // Convert backend object rows into frontend 2D array rows.
    const rows = (backendResponse.rows || []).map((row) => {

        if (Array.isArray(row)) {
            return row as QueryResponse['rows'] extends (infer R)[] ? R : never;
        }

        const record = row as Record<string, unknown>;

        return columns.map((column) => {
            const value = record[column];

            if (
                value === null ||
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean'
            ) {
                return value;
            }

            return value == null ? null : String(value);
        });
    }) as QueryResponse['rows'];

    return {
        query_id: backendResponse.query_id || `query-${Date.now()}`,

        status: backendResponse.status === 'success'
            ? 'success'
            : 'error',

        answer: backendResponse.answer || backendResponse.message || '',

        message: backendResponse.message || '',

        sql: backendResponse.sql || null,

        columns,

        rows,

        row_count: backendResponse.row_count ?? rows?.length ?? 0,

        warnings: backendResponse.warnings || [],

        chart: backendResponse.chart || null,
    };
}
// Generate real AI insights for selected dataset
export async function executeBackendInsights(
    datasetId: string
): Promise<BackendInsightsResponse> {

    return backendRequest<BackendInsightsResponse>(
        '/analytics/insights',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dataset_id: datasetId,
            }),
        }
    );
}
// Execute real What-If Simulator analysis
export async function executeBackendWhatIf(
    datasetId: string,
    priceChange: number,
    discountCap: number,
    adSpend: number,
    churnDelta: number
): Promise<BackendWhatIfResponse> {

    return backendRequest<BackendWhatIfResponse>(
        '/analytics/what-if',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dataset_id: datasetId,
                price_change: priceChange,
                discount_cap: discountCap,
                ad_spend: adSpend,
                churn_delta: churnDelta,
            }),
        }
    );
}
export interface BackendPredictiveResponse {
    success: boolean;
    dataset_name: string;
    model: string;
    target: string;
    features: string[];
    training_records: number;
    testing_records: number;

    metrics: {
        r2: number | null;
        rmse: number;
        mae: number;
        training_time_ms: number;
    };

    feature_importance: {
        name: string;
        weight: number;
    }[];

    predictions: {
        id: string;
        actual: number;
        predicted: number;
        difference: number;
        absolute_error: number;
        error_percentage: number | null;
        confidence_bound: number;
    }[];

    chart: {
        columns: string[];
        rows: (string | number | null)[][];
        chartHint: {
            type: string;
            x: string;
            y: string;
            title: string;
        };
    };

    message: string;
}

export async function executeBackendPredictiveAnalysis(
    datasetId: string,
    model: string,
    features: string[]
): Promise<BackendPredictiveResponse> {

    return backendRequest<BackendPredictiveResponse>(
        '/analytics/predict',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dataset_id: datasetId,
                model,
                features,
            }),
        }
    );
}
// ==========================================
// AUTHENTICATION API
// ==========================================

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    access_token: string;
    token_type: string;
    user: AuthUser;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    access_token: string;
    token_type: string;
    user: AuthUser;
}

// Register user
export async function registerUser(
    data: RegisterRequest
): Promise<RegisterResponse> {

    return backendRequest<RegisterResponse>(
        "/auth/register",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
}

// Login user
export async function loginUser(
    data: LoginRequest
): Promise<LoginResponse> {

    return backendRequest<LoginResponse>(
        "/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
}