import React from 'react';
import { Database, FileSpreadsheet, Upload, ArrowLeftRight, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface TopBarProps {
  activeDatasetName?: string | null;
  activeDatasetSize?: string | null;
  systemStatus?: string | null;
  latencyMs?: number | null;
  schemaVerified?: boolean | null;
  isMockMode?: boolean;
  onOpenUpload?: () => void;
  onOpenSwitcher?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeDatasetName,
  activeDatasetSize,
  systemStatus,
  latencyMs,
  schemaVerified,
  isMockMode = false,
  onOpenUpload,
  onOpenSwitcher,
}) => {
  return (
    <header className="h-14 border-b border-tint bg-surface px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Brand and Active Dataset */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2 font-semibold text-primary tracking-tight text-lg">
          <Database className="w-5 h-5 text-primary" aria-hidden="true" />
          <span className="text-ink font-semibold">DataTalk AI</span>
        </div>

        <div className="h-5 w-px bg-tint mx-1" aria-hidden="true" />

        {/* Active Dataset Indicator */}
        <div className="flex items-center gap-2">
          {activeDatasetName ? (
            <div
              className="flex items-center gap-2 px-3 py-1 rounded bg-tint/40 border border-tint text-xs font-mono text-ink truncate max-w-xs"
              title={`Active dataset: ${activeDatasetName}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{activeDatasetName}</span>
              {activeDatasetSize && (
                <span className="text-ink-muted text-[11px] shrink-0 font-sans">{activeDatasetSize}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-tint/20 border border-dashed border-tint text-xs text-ink-muted">
              <span>No dataset loaded</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSwitcher}
            icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
            className="text-xs text-ink hover:text-primary"
            aria-label="Switch dataset"
          >
            Switch dataset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenUpload}
            icon={<Upload className="w-3.5 h-3.5" />}
            className="text-xs"
            aria-label="Upload dataset"
          >
            Upload dataset
          </Button>
        </div>
      </div>

      {/* Right: Status Indicators */}
      <div className="flex items-center gap-3">
        {/* Mock Badge */}
        {isMockMode && (
          <Badge variant="mock" size="sm" title="Running in development mock mode">
            Mock data
          </Badge>
        )}

        {/* Conditional Status Metrics - strictly shown only if provided */}
        {systemStatus && (
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" aria-hidden="true" />
            <span>{systemStatus}</span>
          </div>
        )}

        {latencyMs !== null && latencyMs !== undefined && (
          <div className="flex items-center gap-1 text-xs text-ink-muted">
            <Clock className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
            <span>Latency {latencyMs}ms</span>
          </div>
        )}

        {schemaVerified === true && (
          <div className="flex items-center gap-1 text-xs text-status-success font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-status-success" aria-hidden="true" />
            <span>Schema verified</span>
          </div>
        )}
      </div>
    </header>
  );
};
