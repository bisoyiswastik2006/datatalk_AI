import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-12 rounded-xl border border-dashed border-border bg-card/60 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-4 ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-xl bg-page border border-border flex items-center justify-center text-primary shadow-sm">
        {icon}
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-title-card font-semibold text-main">{title}</h3>
        <p className="text-body text-secondary leading-relaxed">{description}</p>
      </div>

      {(actionText || secondaryActionText) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {secondaryActionText && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {actionText && (
            <Button
              variant="primary"
              size="sm"
              icon={actionIcon}
              onClick={onAction}
            >
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

