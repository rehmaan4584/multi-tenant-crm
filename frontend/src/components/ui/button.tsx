import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 bg-white hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
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
      className={`rounded px-3 py-2 text-sm font-medium disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
