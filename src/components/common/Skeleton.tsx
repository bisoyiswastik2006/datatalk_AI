import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'kpi' | 'table';
  width?: string;
  height?: string;
  rows?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  rows = 4,
}) => {
  const baseAnimation = 'animate-pulse bg-page/80 border border-border/50 rounded-lg';

  if (variant === 'kpi') {
    return (
      <div className={`p-5 rounded-xl border border-border bg-card shadow-sm space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-page/80 rounded animate-pulse" />
          <div className="w-8 h-8 rounded-lg bg-page/80 animate-pulse" />
        </div>
        <div className="h-8 w-32 bg-page/80 rounded animate-pulse" />
        <div className="h-3 w-40 bg-page/80 rounded animate-pulse" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`rounded-xl border border-border bg-card overflow-hidden ${className}`}>
        <div className="h-12 bg-page/60 border-b border-border flex items-center px-4 gap-4">
          <div className="h-4 w-12 bg-border/60 rounded animate-pulse" />
          <div className="h-4 w-32 bg-border/60 rounded animate-pulse" />
          <div className="h-4 w-28 bg-border/60 rounded animate-pulse" />
          <div className="h-4 w-24 bg-border/60 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-border/60 p-2 space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-10 flex items-center px-3 gap-4">
              <div className="h-3 w-8 bg-page/80 rounded animate-pulse" />
              <div className="h-3 w-40 bg-page/80 rounded animate-pulse" />
              <div className="h-3 w-28 bg-page/80 rounded animate-pulse" />
              <div className="h-3 w-20 bg-page/80 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const shapeStyles = {
    text: 'h-4 rounded',
    rect: 'rounded-xl',
    circle: 'rounded-full',
  };

  return (
    <div
      style={{ width, height }}
      className={`${baseAnimation} ${shapeStyles[variant as 'text' | 'rect' | 'circle'] || ''} ${className}`}
    />
  );
};

