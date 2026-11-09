export type DatasetFormat = 'csv' | 'xlsx' | 'xls' | 'sqlite' | 'db';

export type DatasetStatus = 'processing' | 'ready' | 'failed' | 'validation_failed';

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  null_count?: number;
  null_percentage?: number;
  distinct_count?: number;
  sample_values?: (string | number | boolean | null)[];
  description?: string;
  min_value?: number | string;
  max_value?: number | string;
}

export interface TableSchema {
  name: string;
  row_count: number;
  column_count: number;
  columns: ColumnSchema[];
}

export interface SchemaResponse {
  dataset_id: string;
  tables: TableSchema[];
  relationships?: {
    from_table: string;
    from_column: string;
    to_table: string;
    to_column: string;
  }[];
  verified?: boolean;
}

export interface DatasetPreviewResponse {
  dataset_id: string;
  table_name: string;
  columns: string[];
  rows: (string | number | boolean | null)[][];
  total_rows: number;
  preview_limit: number;
}

export interface DatasetDetail {
  id: string;
  name: string;
  format: DatasetFormat;
  size_bytes?: number;
  formatted_size?: string;
  status: DatasetStatus;
  tables: string[];
  total_rows: number;
  total_columns: number;
  created_at: string;
  processing_warnings?: string[];
  metadata?: {
    engine?: string;
    memory_mb?: number;
    session_id?: string;
  };
}

export interface DatasetUploadResponse {
  dataset_id: string;
  status: DatasetStatus;
  message?: string;
}

