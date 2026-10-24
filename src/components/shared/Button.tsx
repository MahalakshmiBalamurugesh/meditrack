import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const BASE_STYLE: React.CSSProperties = {
  minWidth: '44px',
  minHeight: '44px',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'background-color 0.15s ease, opacity 0.15s ease',
  lineHeight: 1.2,
};

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    backgroundColor: '#0d9488',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#ffffff',
    color: '#0d9488',
    border: '2px solid #0d9488',
  },
  danger: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
};

const DISABLED_STYLE: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export function Button({
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  children,
  className,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const style: React.CSSProperties = {
    ...BASE_STYLE,
    ...VARIANT_STYLES[variant],
    ...(disabled ? DISABLED_STYLE : {}),
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={style}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}