import React from 'react';
import {
  Menu,
  Search,
  FileSpreadsheet,
  ArrowLeftRight,
  Upload,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';

export interface TopBarProps {
  pageTitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeDatasetName?: string | null;
  activeDatasetSize?: string | null;
  isMockMode?: boolean;
  onOpenUpload?: () => void;
  onOpenSwitcher?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  searchQuery,
  onSearchChange,
  activeDatasetName,
  activeDatasetSize,
  isMockMode = false,
  onOpenUpload,
  onOpenSwitcher,
  onOpenMobileSidebar,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 gap-3">
      {/* Left: Mobile hamburger & Page title */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden w-10 h-10 min-h-[40px] flex items-center justify-center rounded-lg border border-border text-secondary hover:text-main hover:bg-page transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-title-card font-semibold text-main truncate tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Search Field (client-side filter for datasets and session chat history) */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search datasets, schema & history..."
            className="w-full pl-10 pr-9 py-2 min-h-[40px] rounded-xl bg-page border border-border text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="w-6 h-6 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-main"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Active Dataset Selector & Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Mock Badge */}
        {isMockMode && (
          <Badge variant="mock" size="sm" title="Running in development mock mode">
            Mock data
          </Badge>
        )}

        {/* Dataset Selector Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {activeDatasetName ? (
            <button
              onClick={onOpenSwitcher}
              className="flex items-center gap-2 min-h-[40px] px-3 py-1.5 rounded-xl bg-page border border-border hover:border-primary text-caption font-mono text-main truncate max-w-[160px] sm:max-w-xs transition-colors cursor-pointer"
              title={`Active dataset: ${activeDatasetName} (Click to switch)`}
            >
              <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{activeDatasetName}</span>
              {activeDatasetSize && (
                <span className="text-secondary text-caption shrink-0 font-sans hidden sm:inline">
                  {activeDatasetSize}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 min-h-[40px] px-3 py-1.5 rounded-xl bg-page/60 border border-dashed border-border hover:border-primary text-caption text-secondary transition-colors cursor-pointer"
              title="Click to connect a dataset"
            >
              <Upload className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">No dataset selected</span>
            </button>
          )}

          {activeDatasetName && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSwitcher}
              icon={<ArrowLeftRight className="w-4 h-4" />}
              className="hidden lg:inline-flex"
              title="Switch dataset"
              aria-label="Switch dataset"
            >
              Switch
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenUpload}
            icon={<Upload className="w-4 h-4" />}
            className="hidden sm:inline-flex"
            aria-label="Upload dataset"
          >
            Upload
          </Button>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 min-h-[40px] flex items-center justify-center rounded-xl border border-border bg-card text-main hover:text-primary hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shrink-0"
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
