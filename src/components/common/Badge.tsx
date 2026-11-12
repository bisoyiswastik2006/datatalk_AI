import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'tint' | 'outline' | 'success' | 'warning' | 'error' | 'destructive' | 'mock';
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
    sm: 'text-caption px-2.5 py-1 gap-1.5 font-medium',
    md: 'text-caption px-3 py-1.5 gap-2 font-medium',
  };

  const variantStyles = {
    default: 'bg-card text-main border border-border',
    primary: 'bg-primary text-primary-text font-semibold',
    tint: 'bg-primary-tint text-primary border border-primary/30',
    outline: 'bg-transparent text-main border border-border',
    success: 'bg-primary-tint text-primary border border-primary/30',
    warning: 'bg-warning text-warning-text border border-warning font-semibold',
    error: 'bg-error/15 text-error border border-error/40 font-semibold',
    destructive: 'bg-destructive/15 text-destructive border border-destructive/40 font-semibold',
    mock: 'bg-warning text-warning-text border border-warning font-semibold tracking-normal text-caption',
  };

  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-md leading-none whitespace-nowrap select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
