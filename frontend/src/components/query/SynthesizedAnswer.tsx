import React from 'react';
import { Check, Clock, CheckCircle2 } from 'lucide-react';
import { QueryResponse } from '../../types/query';

export interface SynthesizedAnswerProps {
  response: QueryResponse;
}

export const SynthesizedAnswer: React.FC<SynthesizedAnswerProps> = ({ response }) => {
  const answerText = response.answer || response.message || 'Analysis complete.';

  return (
    <div className="space-y-2">
      {/* Answer Title: 26-28px, weight 600, line-height 1.3 */}
      <h1 className="text-title-page font-semibold text-main leading-tight tracking-tight">
        {answerText}
      </h1>

      {/* Metrics Row - strictly shows metrics actually returned by API in a clean metadata line */}
      <div className="flex flex-wrap items-center gap-4 text-caption text-secondary">
        {response.confidence !== undefined && response.confidence !== null && (
          <div className="flex items-center gap-1.5">
            <span>Confidence:</span>
            <span className="font-mono text-main font-medium">
              {(response.confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {response.row_count !== undefined && response.row_count !== null && (
          <div className="flex items-center gap-1 text-secondary">
            <Check className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>{response.row_count} rows returned</span>
          </div>
        )}

        {response.execution_ms !== undefined && response.execution_ms !== null && (
          <div className="flex items-center gap-1 text-secondary">
            <Clock className="w-4 h-4 text-secondary" aria-hidden="true" />
            <span>{response.execution_ms}ms</span>
          </div>
        )}

        {response.cached === true && (
          <span className="text-caption font-medium px-2 py-0.5 rounded-md bg-card text-main border border-border flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            Cached
          </span>
        )}
      </div>
    </div>
  );
};
