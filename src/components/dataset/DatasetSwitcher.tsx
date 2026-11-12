import React from 'react';
import { Database, FileSpreadsheet, Check, Trash2, Upload, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DatasetDetail } from '../../types/dataset';

export interface DatasetSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  datasets: DatasetDetail[];
  activeDatasetId?: string | null;
  onSelectDataset: (id: string) => void;
  onDeleteDataset?: (id: string) => void;
  onOpenUpload?: () => void;
}

export const DatasetSwitcher: React.FC<DatasetSwitcherProps> = ({
  isOpen,
  onClose,
  datasets,
  activeDatasetId,
  onSelectDataset,
  onDeleteDataset,
  onOpenUpload,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Switch active dataset" maxWidth="lg">
      <div className="space-y-4">
        <p className="text-body text-secondary leading-relaxed">
          Switching datasets resets the current query session, table views, and visualizations to prevent stale context.
        </p>

        {/* Dataset list */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
          {datasets.map((ds) => {
            const isActive = ds.id === activeDatasetId;
            return (
              <div
                key={ds.id}
                onClick={() => {
                  if (!isActive) {
                    onSelectDataset(ds.id);
                    onClose();
                  }
                }}
                className={`p-4 rounded-lg border transition-colors cursor-pointer flex items-center justify-between min-h-[72px] ${
                  isActive
                    ? 'border-primary bg-primary-tint'
                    : 'border-border bg-card hover:border-primary'
                }`}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-primary text-primary-text'
                        : 'bg-page border border-border text-secondary'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-control text-main truncate font-mono">
                        {ds.name}
                      </span>
                      {isActive && (
                        <Badge variant="primary" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-caption text-secondary mt-0.5">
                      <span>{ds.format.toUpperCase()}</span>
                      <span>·</span>
                      <span>{ds.formatted_size || 'In-memory'}</span>
                      {ds.total_rows !== undefined && (
                        <>
                          <span>·</span>
                          <span>{ds.total_rows.toLocaleString()} rows</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isActive ? (
                    <span className="text-caption text-primary font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Loaded
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDataset(ds.id);
                        onClose();
                      }}
                    >
                      Select
                    </Button>
                  )}

                  {onDeleteDataset && !isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDataset(ds.id);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-secondary hover:text-destructive hover:bg-page transition-colors cursor-pointer"
                      title={`Remove ${ds.name}`}
                      aria-label={`Remove dataset ${ds.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {datasets.length === 0 && (
            <div className="py-8 text-center text-body text-secondary border border-dashed border-border rounded-lg bg-page">
              <Database className="w-8 h-8 mx-auto mb-2 text-secondary opacity-50" />
              <span>No datasets currently registered.</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="text-caption text-secondary flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-primary shrink-0" />
            <span>DuckDB in-memory session</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={onClose}>
              Close
            </Button>
            {onOpenUpload && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                icon={<Upload className="w-4 h-4" />}
              >
                Upload new
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
