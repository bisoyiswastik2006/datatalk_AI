import { DatasetDetail, SchemaResponse, DatasetPreviewResponse, DatasetUploadResponse } from '../../types/dataset';
import { QueryRequest, QueryResponse } from '../../types/query';
import { HealthResponse } from '../../types/api';
import { MOCK_DATASETS, MOCK_SCHEMAS, MOCK_PREVIEWS, MOCK_QUERY_RESPONSES } from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockAdapter {
  private datasets: DatasetDetail[] = [...MOCK_DATASETS];

  async health(): Promise<HealthResponse> {
    await delay(150);
    return {
      status: 'ok',
      version: '1.0.0',
      engine: 'DuckDB 0.9.2 (In-Memory)',
      memory_free_mb: 2840,
    };
  }

  async getDatasets(): Promise<DatasetDetail[]> {
    await delay(200);
    return [...this.datasets];
  }

  async getDataset(datasetId: string): Promise<DatasetDetail> {
    await delay(200);
    const ds = this.datasets.find((d) => d.id === datasetId);
    if (!ds) {
      throw new Error(`Dataset '${datasetId}' not found`);
    }
    return ds;
  }

  async getSchema(datasetId: string): Promise<SchemaResponse> {
    await delay(300);
    const schema = MOCK_SCHEMAS[datasetId] || MOCK_SCHEMAS['dataset-retail-01'];
    return schema;
  }

  async getPreview(datasetId: string, table?: string, limit: number = 10): Promise<DatasetPreviewResponse> {
    await delay(300);
    const preview = MOCK_PREVIEWS[datasetId] || MOCK_PREVIEWS['dataset-retail-01'];
    return {
      ...preview,
      table_name: table || preview.table_name,
      rows: preview.rows.slice(0, limit),
      preview_limit: limit,
    };
  }

  async uploadDataset(file: File): Promise<DatasetUploadResponse> {
    await delay(600);
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['csv', 'xlsx', 'xls', 'sqlite', 'db'];
    if (!extension || !allowed.includes(extension)) {
      throw new Error(`Unsupported format '.${extension}'. Only CSV, XLSX, and SQLite files are allowed.`);
    }

    const newId = `dataset-${Date.now()}`;
    const newDataset: DatasetDetail = {
      id: newId,
      name: file.name,
      format: (extension === 'xls' ? 'xlsx' : extension === 'db' ? 'sqlite' : extension) as any,
      size_bytes: file.size,
      formatted_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: 'ready',
      tables: ['imported_table'],
      total_rows: 1540,
      total_columns: 8,
      created_at: new Date().toISOString(),
      metadata: {
        engine: 'DuckDB 0.9.2',
        session_id: `#dk-${Math.random().toString(36).substring(2, 7)}`,
      },
    };

    this.datasets.unshift(newDataset);
    return {
      dataset_id: newId,
      status: 'ready',
      message: 'Dataset uploaded and validated successfully',
    };
  }

  async deleteDataset(datasetId: string): Promise<{ success: boolean }> {
    await delay(200);
    this.datasets = this.datasets.filter((d) => d.id !== datasetId);
    return { success: true };
  }

  async executeQuery(req: QueryRequest): Promise<QueryResponse> {
    await delay(600);
    const q = req.question.toLowerCase();

    if (q.includes('salary') || q.includes('employee') || q.includes('compensation')) {
      return MOCK_QUERY_RESPONSES.salary;
    }
    if (q.includes('date') && !q.includes('q3') && !q.includes('between')) {
      return MOCK_QUERY_RESPONSES.ambiguous_date;
    }
    if (q.includes('drop') || q.includes('delete') || q.includes('update') || q.includes('insert')) {
      return MOCK_QUERY_RESPONSES.rejected_sql;
    }
    if (q.includes('timeout') || q.includes('heavy') || q.includes('infinite')) {
      return MOCK_QUERY_RESPONSES.timeout;
    }
    if (q.includes('antarctica') || q.includes('zero') || q.includes('empty')) {
      return MOCK_QUERY_RESPONSES.empty;
    }

    // Default success matching Stitch query screen
    return {
      ...MOCK_QUERY_RESPONSES.default,
      query_id: `query-${Date.now()}`,
    };
  }
}

export const mockAdapter = new MockAdapter();

