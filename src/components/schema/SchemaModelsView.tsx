import React from 'react';
import { GitBranch, Database, ShieldCheck, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { DatasetDetail, SchemaResponse } from '../../types/dataset';

export interface SchemaModelsViewProps {
  dataset: DatasetDetail;
  schema: SchemaResponse | null;
}

export const SchemaModelsView: React.FC<SchemaModelsViewProps> = ({ dataset, schema }) => {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-tint select-none">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-ink-muted uppercase tracking-wider">
            <span>WORKBENCH</span>
            <span>/</span>
            <span>SCHEMA MODELS</span>
          </div>
          <h1 className="text-xl font-semibold text-ink font-mono">{dataset.name}</h1>
        </div>

        {schema?.verified && (
          <div className="flex items-center gap-1.5 text-xs text-status-success font-medium bg-status-success-bg px-3 py-1 rounded-full border border-status-success/30">
            <ShieldCheck className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
            <span>Schema verified & indexed</span>
          </div>
        )}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schema?.tables.map((table) => (
          <div
            key={table.name}
            className="rounded-lg border border-tint bg-surface shadow-subtle flex flex-col overflow-hidden"
          >
            {/* Table Header */}
            <div className="px-4 py-3 bg-[#E8E4DA] border-b border-tint flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-mono text-sm font-semibold text-ink">{table.name}</span>
              </div>
              <span className="text-[11px] font-mono text-ink-muted">
                {table.row_count.toLocaleString()} rows
              </span>
            </div>

            {/* Columns List */}
            <div className="divide-y divide-tint/60 max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {table.columns.map((col) => (
                <div
                  key={col.name}
                  className="p-2 rounded hover:bg-tint/20 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-medium text-ink block truncate">
                      {col.name}
                    </span>
                    <span className="text-[10px] text-ink-muted font-mono block">
                      {col.nullable ? 'nullable' : 'non-null'}{' '}
                      {col.distinct_count !== undefined && `| ${col.distinct_count} distinct`}
                    </span>
                  </div>

                  <Badge variant="tint" size="sm" className="font-mono shrink-0 text-[10px]">
                    {col.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Relationships Section */}
      {schema?.relationships && schema.relationships.length > 0 && (
        <div className="pt-4 border-t border-tint space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-ink-muted font-semibold">
            <GitBranch className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Inferred Relationships</span>
          </div>

          <div className="space-y-2 max-w-2xl">
            {schema.relationships.map((rel, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-surface border border-tint text-xs text-ink flex items-center gap-3 font-mono"
              >
                <span className="font-semibold text-primary">{rel.from_table}.{rel.from_column}</span>
                <ArrowRight className="w-4 h-4 text-secondary shrink-0" />
                <span className="font-semibold text-ink">{rel.to_table}.{rel.to_column}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

