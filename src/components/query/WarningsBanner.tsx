import React from 'react';
import { Info } from 'lucide-react';

export interface WarningsBannerProps {
  warnings?: string[] | null;
}

export const WarningsBanner: React.FC<WarningsBannerProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="rounded-md bg-tint/30 border border-tint p-3 text-xs text-ink flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <span className="leading-tight">{warnings.join(' ')}</span>
      </div>
    </div>
  );
};

