import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none rounded-lg text-control';

  const sizeStyles = {
    sm: 'min-h-[40px] px-3.5 py-2 gap-2',
    md: 'min-h-[42px] px-4 py-2.5 gap-2',
    lg: 'min-h-[46px] px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-primary text-primary-text font-semibold hover:opacity-90 active:opacity-80',
    secondary: 'bg-card border border-border text-main hover:border-primary hover:text-primary',
    ghost: 'bg-transparent text-main hover:bg-card hover:text-primary',
    outline: 'bg-card border border-border text-main hover:border-primary hover:text-primary',
    danger: 'bg-destructive text-destructive-text font-semibold hover:opacity-90 active:opacity-80',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  );
};
