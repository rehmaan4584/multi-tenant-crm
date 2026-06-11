import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary:
    'border border-border bg-surface text-text hover:bg-surface-muted shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
