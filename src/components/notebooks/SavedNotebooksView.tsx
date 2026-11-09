import React from 'react';
import { Bookmark, Clock, Play } from 'lucide-react';
import { Button } from '../common/Button';
import { DatasetDetail } from '../../types/dataset';
import { ChatMessage } from '../../types/chat';

export interface SavedNotebooksViewProps {
  dataset: DatasetDetail;
  messages: ChatMessage[];
  onRerunQuery?: (question: string) => void;
}

export const SavedNotebooksView: React.FC<SavedNotebooksViewProps> = ({
  dataset,
  messages,
  onRerunQuery,
}) => {
  const userQueries = messages.filter((m) => m.role === 'user');

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-tint select-none">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-ink-muted uppercase tracking-wider">
            <span>WORKBENCH</span>
            <span>/</span>
            <span>SAVED NOTEBOOKS</span>
          </div>
          <h1 className="text-xl font-semibold text-ink font-mono">{dataset.name}</h1>
        </div>

        <span className="text-xs font-mono text-ink-muted">
          {userQueries.length} query {userQueries.length === 1 ? 'entry' : 'entries'} in active session
        </span>
      </div>

      {/* Query History Log */}
      <div className="space-y-3 max-w-3xl">
        {userQueries.map((query, idx) => (
          <div
            key={query.id}
            className="p-4 rounded-lg bg-surface border border-tint hover:border-secondary transition-all shadow-subtle space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-ink-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                Query #{idx + 1} at {query.timestamp}
              </span>

              {onRerunQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRerunQuery(query.content)}
                  icon={<Play className="w-3 h-3 text-primary" />}
                  className="text-xs"
                >
                  Rerun
                </Button>
              )}
            </div>

            <p className="text-sm font-semibold text-ink leading-snug">
              {query.content}
            </p>
          </div>
        ))}

        {userQueries.length === 0 && (
          <div className="p-8 rounded-lg border border-dashed border-tint text-center space-y-3 bg-surface/50">
            <Bookmark className="w-8 h-8 text-ink-muted mx-auto" aria-hidden="true" />
            <h2 className="text-base font-semibold text-ink">No saved queries yet</h2>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Any questions you ask in Query Studio will automatically log here as a reproducible notebook for {dataset.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
