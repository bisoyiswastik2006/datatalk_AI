import React from 'react';
import { QueryResponse } from '../../types/query';
import { SynthesizedAnswer } from './SynthesizedAnswer';
import { SqlViewer } from './SqlViewer';
import { ResultTable } from './ResultTable';
import { ChartPanel } from './ChartPanel';
import { WarningsBanner } from './WarningsBanner';

export interface QueryStudioProps {
  queryResponse: QueryResponse;
}

export const QueryStudio: React.FC<QueryStudioProps> = ({ queryResponse }) => {
  const hasResults = queryResponse.rows && queryResponse.rows.length > 0;
  const hasSql = Boolean(queryResponse.sql);

  return (
    <div className="flex flex-col h-full space-y-5 pb-6">
      {/* Synthesized Answer */}
      <SynthesizedAnswer response={queryResponse} />

      {/* SQL Viewer */}
      {hasSql && (
        <SqlViewer
          sql={queryResponse.sql!}
          dialect="DuckDB ANSI-92"
          defaultExpanded={true}
        />
      )}

      {/* Results and Visualization Split */}
      {hasResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[340px]">
          {/* Query Results Table */}
          <div className="h-full min-h-[300px]">
            <ResultTable
              columns={queryResponse.columns || []}
              rows={queryResponse.rows || []}
              rowCount={queryResponse.row_count}
              tableName="Query results"
            />
          </div>

          {/* Plotly Chart Panel */}
          <div className="h-full min-h-[300px]">
            <ChartPanel
              columns={queryResponse.columns || []}
              rows={queryResponse.rows || []}
              chartHint={queryResponse.chart}
            />
          </div>
        </div>
      )}

      {/* Warnings Banner */}
      {queryResponse.warnings && queryResponse.warnings.length > 0 && (
        <WarningsBanner warnings={queryResponse.warnings} />
      )}
    </div>
  );
};

