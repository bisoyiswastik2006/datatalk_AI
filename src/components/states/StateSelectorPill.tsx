import React from 'react';
import { Layers } from 'lucide-react';
import { QueryFlowState } from '../../context/QueryContext';

export interface StateSelectorPillProps {
  currentState: QueryFlowState;
  onSelectState: (state: QueryFlowState) => void;
}

export const StateSelectorPill: React.FC<StateSelectorPillProps> = ({
  currentState,
  onSelectState,
}) => {
  const states: { id: QueryFlowState; label: string }[] = [
    { id: 'idle', label: 'Idle / Ready' },
    { id: 'generating_sql', label: 'Generating SQL' },
    { id: 'executing', label: 'Executing' },
    { id: 'results', label: 'Results' },
    { id: 'not_answerable', label: 'Not Answerable' },
    { id: 'needs_clarification', label: 'Needs Clarification' },
    { id: 'rejected', label: 'SQL Rejected' },
    { id: 'timeout', label: 'Timeout' },
    { id: 'empty_result', label: 'Empty Result' },
    { id: 'error', label: 'Error' },
  ];

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-tint rounded-full text-xs shadow-subtle select-none">
      <Layers className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
      <span className="font-mono text-ink-muted text-[11px] uppercase mr-1">State Demo:</span>
      <select
        value={currentState}
        onChange={(e) => onSelectState(e.target.value as QueryFlowState)}
        className="bg-transparent text-ink font-medium text-xs focus:outline-none cursor-pointer"
        aria-label="Preview UI State"
      >
        {states.map((s) => (
          <option key={s.id} value={s.id} className="bg-surface text-ink">
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
};

