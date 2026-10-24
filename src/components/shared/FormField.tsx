import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#1e293b',
  marginBottom: '6px',
};

const REQUIRED_STYLE: React.CSSProperties = {
  color: '#dc2626',
  marginLeft: '2px',
};

const ERROR_STYLE: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '13px',
  marginTop: '4px',
};

const WRAPPER_STYLE: React.CSSProperties = {
  marginBottom: '16px',
  display: 'flex',
  flexDirection: 'column',
};

export function FormField({
  label,
  htmlFor,
  error,
  required = false,
  children,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`;

  return (
    <div style={WRAPPER_STYLE}>
      <label htmlFor={htmlFor} style={LABEL_STYLE}>
        {label}
        {required && <span style={REQUIRED_STYLE} aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" style={ERROR_STYLE}>
          {error}
        </p>
      )}
    </div>
  );
}