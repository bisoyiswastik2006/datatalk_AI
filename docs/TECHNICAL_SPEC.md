# Technical Specification: DataTalk AI Frontend

## 1. Overview
DataTalk AI is a dataset-independent natural-language analytics web application. The frontend operates against a RESTful API (`/api/v1`) and supports uploading, exploring, and querying structured datasets (CSV, XLSX, SQLite) using conversational natural language queries.

## 2. Architecture & Folder Structure
```
src/
├── assets/                  # Static assets and icons
├── components/
│   ├── common/              # Reusable atoms: Button, Badge, Modal, Tooltip, Dropdown
│   ├── layout/              # AppShell, TopBar, Sidebar, WorkspaceLayout
│   ├── dataset/             # UploadZone, DatasetPreviewModal, SchemaViewer, DatasetSwitcher
│   ├── query/               # QueryStudio, SynthesizedAnswer, SqlViewer, ResultTable, ChartPanel, WarningsBanner
│   ├── assistant/           # AssistantPanel, ChatThread, ChatMessage, SuggestedQuestions, QueryInput
│   └── states/              # Explicit state views for all 14 application states
├── context/                 # DatasetContext, QueryContext
├── config/                  # Environment config, limits, feature flags
├── services/
│   ├── api.ts               # Typed REST API client
│   └── mocks/               # Mock adapter and test dataset fixtures
├── styles/
│   ├── fonts/               # Nohemi font-face declarations
│   └── index.css            # Tailwind directives, CSS variables, utility classes
├── types/
│   ├── api.ts               # API requests, responses, error models
│   ├── dataset.ts           # Dataset, table, schema types
│   ├── query.ts             # Query requests, results, chart hints
│   └── chat.ts              # Chat messages and conversation state
├── utils/                   # Schema-derived question generator, Plotly layout helpers, formatting
├── App.tsx                  # Root application component
└── main.tsx                 # Entrypoint
```

## 3. Design Tokens & Theme Rules
- **Primary Color:** `#3368A0` (Active states, primary buttons, links, key series, focus rings).
- **Secondary Color:** `#66A3BF` (Secondary chart series, hover states, active borders, icons). **Rule: Never use #66A3BF for text on light backgrounds.**
- **Tint:** `#C8DFDB` (Assistant panel background, selected rows, subtle fills).
- **Surface:** `#F2EFE7` (Page background, cards, table backgrounds).
- **Ink:** `#14283D` (Primary body text, headings).
- **Ink Muted:** `#4A5F73` (Captions, table headers, subtitles).
- **Status Colors:** Muted red (`#A62626`), muted amber (`#996000`), muted green (`#1B6A3B`) with accessible backgrounds.
- **Typography:** Nohemi (`@font-face`) fallback: `"Nohemi", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Monospace for code/SQL.
- **No Emoji Rule:** Zero emoji across all UI, text, logs, code, and comments. Use Lucide icons only.

## 4. UI States Specification
1. `empty`: No dataset loaded. Shows upload zone, quick-start templates, disabled Query Copilot.
2. `uploading`: File upload in progress with progress bar, file size, cancel option.
3. `validation_failed`: File format error, corruption, or size exceeded.
4. `processing`: Schema extraction, table registration, type inference in progress.
5. `ready`: Dataset active. Ready for questions.
6. `generating_sql`: Assistant thinking indicator, generating SQL.
7. `executing`: SQL generated, running query against database engine.
8. `results`: Success answer, collapsible SQL viewer, interactive results table, Plotly chart, warning banner.
9. `not_answerable`: Plain-language explanation why query cannot be answered from schema, with recommendations.
10. `needs_clarification`: Ambiguity prompt with clickable clarification options.
11. `sql_rejected`: Guardrail rejection (non-read-only query attempt).
12. `timeout`: Execution exceeded time budget with retry action.
13. `empty_result`: SQL executed successfully but returned 0 rows.
14. `backend_unavailable` / `llm_not_configured`: Service or provider connection issue with actionable guidance.

## 5. Viewport & Accessibility Requirements
- Designed to fit 1440x900 viewport without page-level scrolling.
- Internal scrolling for tables (`custom-scrollbar`) and assistant chat thread.
- Keyboard accessible: Tab navigation, visible 2px `#3368A0` focus rings, Enter to send query, Escape to dismiss modals.
- Respects `prefers-reduced-motion`.
- WCAG AA contrast throughout.

