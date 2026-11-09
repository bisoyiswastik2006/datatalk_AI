import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'tint' | 'outline' | 'success' | 'warning' | 'error' | 'mock';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  title,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
  };

  const variantStyles = {
    default: 'bg-tint text-ink border border-tint',
    primary: 'bg-primary text-white',
    tint: 'bg-tint/70 text-ink border border-secondary/40',
    outline: 'bg-transparent text-ink border border-tint',
    success: 'bg-status-success-bg text-status-success border border-status-success/30',
    warning: 'bg-status-warning-bg text-status-warning border border-status-warning/30',
    error: 'bg-status-error-bg text-status-error border border-status-error/30',
    mock: 'bg-status-warning-bg text-status-warning border border-status-warning font-semibold tracking-wide uppercase text-[10px]',
  };

  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full leading-none whitespace-nowrap select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
