# API Contract: DataTalk AI

Base path: `/api/v1`. Frontend and backend members must agree on exact field names before integration. Example values below are illustrative placeholders, not real results.

## General rules
- Explicit Pydantic request/response models
- Consistent error object (below)
- Validate dataset IDs
- Never accept database paths from the browser; never return server file paths
- No stack traces or secrets in errors
- Request IDs or structured logs
- Strict caps/pagination on all result and preview data

### Error object
```json
{
  "error": {
    "code": "SQL_REJECTED",
    "message": "The generated query was not read-only.",
    "request_id": "req_123",
    "details": null
  }
}
```
Suggested codes: INVALID_FILE, FILE_TOO_LARGE, DATASET_NOT_FOUND, DATASET_PROCESSING, LLM_NOT_CONFIGURED, LLM_PROVIDER_ERROR, NOT_ANSWERABLE, NEEDS_CLARIFICATION, SQL_REJECTED, QUERY_TIMEOUT, INTERNAL_ERROR.

## Endpoints

### GET /health
Returns service status and version.

### POST /datasets
Multipart upload. Backend validates and processes. Returns dataset ID and processing status.
```json
{ "dataset_id": "dataset_123", "status": "processing" }
```

### GET /datasets
Lists datasets with status and metadata.

### GET /datasets/{dataset_id}
Name, format, tables/sheets, row counts, processing warnings.

### GET /datasets/{dataset_id}/schema
Tables, columns, inferred types, nullability, known relationships.

### GET /datasets/{dataset_id}/preview
Small bounded preview only. Never an unlimited dataset.

### DELETE /datasets/{dataset_id}
Deletes only that dataset's stored resources. Document that the prototype is single-user if no auth exists.

### POST /queries
Request:
```json
{
  "dataset_id": "dataset_123",
  "question": "Which category has the highest total value?",
  "conversation_id": null
}
```
Success response:
```json
{
  "query_id": "query_456",
  "status": "success",
  "answer": "Category A has the highest total value in the selected dataset.",
  "sql": "SELECT ...",
  "columns": ["category", "total_value"],
  "rows": [],
  "row_count": 1,
  "execution_ms": 0,
  "chart": { "type": "bar", "x": "category", "y": "total_value" },
  "warnings": []
}
```
Other `status` values: `not_answerable`, `needs_clarification`, `rejected`, `timeout`, `error`. For these, include a human-readable `answer` or `message` explaining why; `sql` may be null.

## Open items to agree on
- Exact field names and types
- Result cap and pagination approach
- Conversation persistence (decision #6 in brief)
- Upload size limits (decision #5)
