import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface StateViewProps {
  icon: React.ReactNode;
  badgeText?: string;
  badgeVariant?: 'default' | 'primary' | 'tint' | 'outline' | 'success' | 'warning' | 'error' | 'destructive';
  title: string;
  description: string;
  primaryActionText?: string;
  primaryActionIcon?: React.ReactNode;
  onPrimaryAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  details?: React.ReactNode;
  className?: string;
}

export const StateView: React.FC<StateViewProps> = ({
  icon,
  badgeText,
  badgeVariant = 'outline',
  title,
  description,
  primaryActionText,
  primaryActionIcon,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
  details,
  className = '',
}) => {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-8 max-w-xl mx-auto my-auto text-center shadow-sm space-y-4 ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-lg bg-page border border-border flex items-center justify-center mx-auto text-main">
        {icon}
      </div>

      <div className="space-y-2">
        {badgeText && (
          <div className="mb-2">
            <Badge variant={badgeVariant} size="sm" className="font-medium text-caption">
              {badgeText}
            </Badge>
          </div>
        )}
        <h2 className="text-title-card font-semibold text-main tracking-tight">{title}</h2>
        <p className="text-body text-secondary leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {details && <div className="pt-2 text-left">{details}</div>}

      {(primaryActionText || secondaryActionText) && (
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
          {secondaryActionText && (
            <Button
              variant="outline"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </Button>
          )}

          {primaryActionText && (
            <Button
              variant="primary"
              size="md"
              onClick={onPrimaryAction}
              icon={primaryActionIcon}
            >
              {primaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
