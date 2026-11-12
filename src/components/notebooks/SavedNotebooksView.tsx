import React from 'react';
import { Bookmark, Clock, Play } from 'lucide-react';
import { Button } from '../common/Button';
import { ChatMessage } from '../../types/chat';
import { DatasetDetail } from '../../types/dataset';

export interface SavedNotebooksViewProps {
  dataset: DatasetDetail;
  messages: ChatMessage[];
  onRerunQuery?: (query: string) => void;
}

export const SavedNotebooksView: React.FC<SavedNotebooksViewProps> = ({
  dataset,
  messages,
  onRerunQuery,
}) => {
  const userQueries = messages.filter((m) => m.role === 'user');

  return (
    <div className="flex flex-col h-full space-y-4 text-main">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border select-none">
        <div>
          <div className="flex items-center gap-2 text-caption font-mono text-secondary">
            <span>Workbench</span>
            <span>/</span>
            <span>Saved notebooks</span>
          </div>
          <h1 className="text-title-card font-semibold text-main font-mono">{dataset.name}</h1>
        </div>
      </div>

      {/* Query History Notebook Cards */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {userQueries.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-lg bg-card border border-border hover:border-primary transition-colors shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between text-caption text-secondary">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Recorded analytical query</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span>{q.timestamp}</span>
              </div>
            </div>

            <p className="text-body font-medium text-main leading-relaxed">
              {q.content}
            </p>

            {onRerunQuery && (
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRerunQuery(q.content)}
                  icon={<Play className="w-3.5 h-3.5" />}
                >
                  Rerun query
                </Button>
              </div>
            )}
          </div>
        ))}

        {userQueries.length === 0 && (
          <div className="py-16 text-center text-body text-secondary border border-dashed border-border rounded-lg bg-page">
            <Bookmark className="w-10 h-10 mx-auto mb-2 text-secondary opacity-40" />
            <p className="text-title-card font-medium text-main mb-1">
              No queries recorded in session yet
            </p>
            <p className="text-caption text-secondary">
              Questions you ask in the Data Assistant will be preserved here during your session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
