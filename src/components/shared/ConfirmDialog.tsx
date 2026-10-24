import React, { useId } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px',
};

const DIALOG_STYLE: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '400px',
  width: '100%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const TITLE_STYLE: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#1e293b',
  margin: '0 0 12px 0',
};

const MESSAGE_STYLE: React.CSSProperties = {
  fontSize: '15px',
  color: '#475569',
  margin: '0 0 24px 0',
  lineHeight: 1.5,
};

const ACTIONS_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  if (!isOpen) return null;

  return (
    <div style={OVERLAY_STYLE} onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={DIALOG_STYLE}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} style={TITLE_STYLE}>
          {title}
        </h2>
        <p style={MESSAGE_STYLE}>{message}</p>
        <div style={ACTIONS_STYLE}>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
