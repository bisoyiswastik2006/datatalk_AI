import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subdued' | 'outline';
  hoverable?: boolean;
  padded?: boolean | 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverable = false,
  padded = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3.5',
    md: 'p-5 sm:p-6',
    lg: 'p-7 sm:p-8',
  };

  const padClass = typeof padded === 'boolean' ? (padded ? paddingStyles.md : '') : paddingStyles[padded];

  const variantStyles = {
    default: 'bg-card border border-border shadow-card',
    glass: 'glass-card shadow-card',
    subdued: 'bg-page border border-border',
    outline: 'bg-transparent border border-border',
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-200 hover:border-primary hover:shadow-card-hover cursor-pointer'
    : 'transition-colors duration-150';

  return (
    <div
      className={`rounded-xl ${variantStyles[variant]} ${hoverStyles} ${padClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

