import React from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

const BANNER_STYLE: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '16px',
};

const TEXT_STYLE: React.CSSProperties = {
  fontSize: '14px',
  color: '#92400e',
  flex: 1,
  lineHeight: 1.5,
};

const DISMISS_STYLE: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  color: '#92400e',
  minWidth: '44px',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  flexShrink: 0,
  padding: '0',
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div role="alert" style={BANNER_STYLE}>
      <p style={TEXT_STYLE}>{message}</p>
      <button
        type="button"
        style={DISMISS_STYLE}
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}