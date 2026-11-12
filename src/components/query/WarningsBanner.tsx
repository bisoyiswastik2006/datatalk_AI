import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface WarningsBannerProps {
  warnings?: string[] | null;
}

export const WarningsBanner: React.FC<WarningsBannerProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="rounded-lg bg-warning border border-warning p-3.5 text-caption text-warning-text flex items-center justify-between gap-3 shrink-0 shadow-sm min-h-[44px]">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-warning-text shrink-0" aria-hidden="true" />
        <span className="leading-relaxed font-medium">{warnings.join(' ')}</span>
      </div>
    </div>
  );
};
