export type QueryStatus =
  | 'success'
  | 'not_answerable'
  | 'needs_clarification'
  | 'rejected'
  | 'timeout'
  | 'error'
  | 'empty_result';

export type ChartType = 'bar' | 'horizontal_bar' | 'line' | 'scatter' | 'pie';

export interface ChartHint {
  type: ChartType;
  x: string;
  y: string | string[];
  title?: string;
  x_label?: string;
  y_label?: string;
  group_by?: string;
}

export interface QueryRequest {
  dataset_id: string;
  question: string;
  conversation_id?: string | null;
}

export interface QueryResponse {
  query_id: string;
  status: QueryStatus;
  answer?: string;
  message?: string;
  sql?: string | null;
  columns?: string[];
  rows?: (string | number | boolean | null)[][];
  row_count?: number;
  execution_ms?: number;
  cached?: boolean;
  confidence?: number;
  chart?: ChartHint | null;
  warnings?: string[];
  clarification_options?: string[];
  suggested_alternatives?: string[];
}

