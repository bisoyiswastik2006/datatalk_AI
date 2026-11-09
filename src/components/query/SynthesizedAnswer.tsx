import React from 'react';
import { Sparkles, Check, Clock, CheckCircle2 } from 'lucide-react';
import { QueryResponse } from '../../types/query';

export interface SynthesizedAnswerProps {
  response: QueryResponse;
}

export const SynthesizedAnswer: React.FC<SynthesizedAnswerProps> = ({ response }) => {
  const answerText = response.answer || response.message || 'Analysis complete.';

  return (
    <div className="space-y-2">
      {/* Metrics Row - only shows metrics actually returned by API */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
        <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-primary text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span>Synthesized Answer</span>
        </div>

        {response.confidence !== undefined && response.confidence !== null && (
          <div className="flex items-center gap-1">
            <span>Confidence:</span>
            <span className="font-mono text-ink font-medium">
              {(response.confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {response.row_count !== undefined && response.row_count !== null && (
          <div className="flex items-center gap-1 text-ink-muted">
            <Check className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
            <span>{response.row_count} rows returned</span>
          </div>
        )}

        {response.execution_ms !== undefined && response.execution_ms !== null && (
          <div className="flex items-center gap-1 text-ink-muted">
            <Clock className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
            <span>{response.execution_ms}ms</span>
          </div>
        )}

        {response.cached === true && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-tint/40 text-ink border border-tint flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-status-success" aria-hidden="true" />
            Cached
          </span>
        )}
      </div>

      {/* Answer Title */}
      <h1 className="text-xl md:text-2xl font-semibold text-ink leading-snug tracking-tight">
        {answerText}
      </h1>
    </div>
  );
};

