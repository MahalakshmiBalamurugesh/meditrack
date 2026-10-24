import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  gap: '16px',
  textAlign: 'center',
};

const MESSAGE_STYLE: React.CSSProperties = {
  fontSize: '16px',
  color: '#64748b',
  margin: 0,
  lineHeight: 1.5,
};

export function EmptyState({ message, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div style={CONTAINER_STYLE}>
      <p style={MESSAGE_STYLE}>{message}</p>
      {ctaLabel && onCta && (
        <Button variant="primary" onClick={onCta}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}