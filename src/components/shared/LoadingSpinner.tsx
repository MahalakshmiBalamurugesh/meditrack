import React from 'react';

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const SPINNER_STYLE: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '3px solid #e2e8f0',
  borderTopColor: '#0d9488',
  borderRadius: '50%',
  animation: 'spin 0.75s linear infinite',
};

const KEYFRAMES = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

let injected = false;

function injectKeyframes() {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  injected = true;
}

export function LoadingSpinner() {
  injectKeyframes();

  return (
    <div style={CONTAINER_STYLE}>
      <div
        role="status"
        aria-label="Loading"
        style={SPINNER_STYLE}
      />
    </div>
  );
}