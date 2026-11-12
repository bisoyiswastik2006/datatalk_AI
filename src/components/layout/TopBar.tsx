import React from 'react';
import { Database, FileSpreadsheet, Upload, ArrowLeftRight, Clock, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Brand and Active Dataset */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 font-semibold text-primary tracking-tight text-title-card">
          <Database className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          <span className="text-main font-semibold">DataTalk AI</span>
        </div>

        <div className="h-6 w-px bg-border mx-1 shrink-0" aria-hidden="true" />

        {/* Active Dataset Indicator */}
        <div className="flex items-center gap-2.5">
          {activeDatasetName ? (
            <div
              className="flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-lg bg-page border border-border text-caption font-mono text-main truncate max-w-xs"
              title={`Active dataset: ${activeDatasetName}`}
            >
              <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{activeDatasetName}</span>
              {activeDatasetSize && (
                <span className="text-secondary text-caption shrink-0 font-sans">{activeDatasetSize}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-lg bg-page/50 border border-dashed border-border text-caption text-secondary">
              <span>No dataset loaded</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSwitcher}
            icon={<ArrowLeftRight className="w-4 h-4" />}
            className="text-control text-main hover:text-primary"
            aria-label="Switch dataset"
          >
            Switch dataset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenUpload}
            icon={<Upload className="w-4 h-4" />}
            className="text-control"
            aria-label="Upload dataset"
          >
            Upload dataset
          </Button>
        </div>
      </div>

      {/* Right: Status Indicators + Theme Toggle */}
      <div className="flex items-center gap-3.5">
        {/* Mock Badge */}
        {isMockMode && (
          <Badge variant="mock" size="sm" title="Running in development mock mode">
            Mock data
          </Badge>
        )}

        {/* Conditional Status Metrics */}
        {systemStatus && (
          <div className="flex items-center gap-2 text-caption text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" aria-hidden="true" />
            <span>{systemStatus}</span>
          </div>
        )}

        {latencyMs !== null && latencyMs !== undefined && (
          <div className="flex items-center gap-1.5 text-caption text-secondary">
            <Clock className="w-4 h-4 text-secondary" aria-hidden="true" />
            <span>Latency {latencyMs}ms</span>
          </div>
        )}

        {schemaVerified === true && (
          <div className="flex items-center gap-1.5 text-caption text-primary font-medium">
            <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
            <span>Schema verified</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 min-h-[40px] flex items-center justify-center rounded-lg border border-border bg-card text-main hover:text-primary hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0 ml-1"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />
          ) : (
            <Moon className="w-5 h-5 text-main shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
};
