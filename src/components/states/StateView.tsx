import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface StateViewProps {
  icon: React.ReactNode;
  badgeText?: string;
  badgeVariant?: 'default' | 'primary' | 'tint' | 'outline' | 'success' | 'warning' | 'error';
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
      className={`rounded-xl border border-tint bg-surface p-8 max-w-xl mx-auto my-auto text-center shadow-card space-y-4 ${className}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-full bg-tint/50 border border-tint flex items-center justify-center text-primary mx-auto">
        {icon}
      </div>

      <div className="space-y-1.5">
        {badgeText && (
          <div className="mb-2">
            <Badge variant={badgeVariant} size="sm" className="uppercase font-mono text-[10px]">
              {badgeText}
            </Badge>
          </div>
        )}
        <h2 className="text-lg font-semibold text-ink tracking-tight">{title}</h2>
        <p className="text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {details && <div className="pt-2 text-left">{details}</div>}

      {(primaryActionText || secondaryActionText) && (
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          {secondaryActionText && onSecondaryAction && (
            <Button variant="ghost" size="sm" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {primaryActionText && onPrimaryAction && (
            <Button
              variant="primary"
              size="sm"
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

