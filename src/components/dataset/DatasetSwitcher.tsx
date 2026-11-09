import React from 'react';
import { FileSpreadsheet, Check, Trash2, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DatasetDetail } from '../../types/dataset';

export interface DatasetSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  datasets: DatasetDetail[];
  activeDatasetId?: string | null;
  onSelectDataset: (datasetId: string) => void;
  onDeleteDataset?: (datasetId: string) => void;
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Active Dataset"
      description="Select an existing dataset or upload a new one to query against."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-tint">
          <span className="text-xs font-mono uppercase text-ink-muted">
            Available Datasets ({datasets.length})
          </span>
          {onOpenUpload && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Upload new
            </Button>
          )}
        </div>

        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
          {datasets.map((dataset) => {
            const isActive = activeDatasetId === dataset.id;
            return (
              <div
                key={dataset.id}
                className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'border-primary bg-tint/30 shadow-subtle'
                    : 'border-tint bg-surface hover:border-secondary hover:bg-tint/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded bg-tint/50 border border-tint flex items-center justify-center shrink-0 text-primary">
                    <FileSpreadsheet className="w-5 h-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-ink truncate">
                        {dataset.name}
                      </span>
                      <Badge variant="outline" size="sm" className="font-mono uppercase text-[10px]">
                        {dataset.format}
                      </Badge>
                    </div>

                    <div className="text-xs text-ink-muted flex items-center gap-2">
                      <span>{dataset.total_rows.toLocaleString()} rows</span>
                      <span>|</span>
                      <span>{dataset.tables.length} {dataset.tables.length === 1 ? 'table' : 'tables'}</span>
                      {dataset.formatted_size && (
                        <>
                          <span>|</span>
                          <span className="font-mono">{dataset.formatted_size}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isActive ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary px-2.5 py-1 rounded bg-tint/50">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      Active
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onSelectDataset(dataset.id);
                        onClose();
                      }}
                    >
                      Select
                    </Button>
                  )}

                  {onDeleteDataset && !isActive && (
                    <button
                      onClick={() => onDeleteDataset(dataset.id)}
                      className="p-1.5 rounded text-ink-muted hover:text-status-error hover:bg-status-error-bg transition-colors"
                      title="Delete dataset"
                      aria-label={`Delete ${dataset.name}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {datasets.length === 0 && (
            <div className="py-8 text-center text-sm text-ink-muted">
              No datasets loaded yet. Upload a CSV, Excel, or SQLite file to begin.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
