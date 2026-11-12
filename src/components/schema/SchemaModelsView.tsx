import React from 'react';
import { ShieldCheck, Key, Database } from 'lucide-react';
import { Badge } from '../common/Badge';
import { DatasetDetail, SchemaResponse } from '../../types/dataset';

export interface SchemaModelsViewProps {
  dataset: DatasetDetail;
  schema?: SchemaResponse | null;
}

export const SchemaModelsView: React.FC<SchemaModelsViewProps> = ({ dataset, schema }) => {
  return (
    <div className="flex flex-col h-full space-y-4 text-main">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border select-none">
        <div>
          <div className="flex items-center gap-2 text-caption font-mono text-secondary">
            <span>Workbench</span>
            <span>/</span>
            <span>Schema models</span>
          </div>
          <h1 className="text-title-card font-semibold text-main font-mono">{dataset.name}</h1>
        </div>

        {schema?.verified && (
          <div className="flex items-center gap-2 text-caption text-primary font-medium bg-primary-tint px-3.5 py-1.5 rounded-lg border border-primary/30">
            <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Schema verified for analytical queries</span>
          </div>
        )}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar">
        {schema?.tables.map((table) => (
          <div
            key={table.name}
            className="rounded-lg border border-border bg-card shadow-sm flex flex-col overflow-hidden"
          >
            {/* Table Card Header */}
            <div className="px-4 py-3 bg-page/70 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono font-semibold text-control text-main">
                <Database className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>{table.name}</span>
              </div>
              <div className="flex items-center gap-2 text-caption text-secondary font-mono">
                {table.row_count !== undefined && (
                  <span>{table.row_count.toLocaleString()} rows</span>
                )}
                <span>·</span>
                <span>{table.columns.length} columns</span>
              </div>
            </div>

            {/* Column List */}
            <div className="divide-y divide-border overflow-y-auto max-h-[320px] custom-scrollbar">
              {table.columns.map((col) => (
                <div
                  key={col.name}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-page/40 transition-colors text-table-cell"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {col.name.toLowerCase().includes('id') && (
                      <Key className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                    )}
                    <span className="font-mono text-main truncate font-medium">
                      {col.name}
                    </span>
                    {!col.nullable && (
                      <span className="text-caption text-secondary font-sans shrink-0">
                        *
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="tint" size="sm" className="font-mono">
                      {col.type}
                    </Badge>
                    {col.distinct_count !== undefined && (
                      <span className="text-caption text-secondary font-mono hidden sm:inline">
                        {col.distinct_count} distinct
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
