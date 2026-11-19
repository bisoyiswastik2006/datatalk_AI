import React from 'react';
import { QueryFlowState } from '../../context/QueryContext';
import { Sparkles } from 'lucide-react';

export interface StateSelectorPillProps {
  currentState: QueryFlowState;
  onSelectState: (state: QueryFlowState) => void;
}

export const StateSelectorPill: React.FC<StateSelectorPillProps> = ({
  currentState,
  onSelectState,
}) => {
  return (
    <div className="flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 bg-card border border-border rounded-lg text-caption shadow-sm select-none">
      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
      <span className="text-secondary font-medium whitespace-nowrap">
        State inspector:
      </span>
      <select
        value={currentState}
        onChange={(e) => onSelectState(e.target.value as QueryFlowState)}
        className="bg-page text-main text-caption font-mono rounded-lg border border-border px-2 py-1 min-h-[32px] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        aria-label="Preview UI state"
      >
        <option value="idle">Idle / Ready</option>
        <option value="uploading">Uploading</option>
        <option value="validation_failed">Validation failed</option>
        <option value="processing">Processing</option>
        <option value="generating_sql">Generating SQL</option>
        <option value="executing">Executing</option>
        <option value="results">Results (Studio)</option>
        <option value="not_answerable">Not answerable</option>
        <option value="needs_clarification">Needs clarification</option>
        <option value="rejected">SQL rejected</option>
        <option value="timeout">Timeout</option>
        <option value="empty_result">Empty result</option>
        <option value="backend_unavailable">Backend unavailable</option>
        <option value="llm_not_configured">LLM not configured</option>
        <option value="error">Execution error</option>
      </select>
    </div>
  );
};
