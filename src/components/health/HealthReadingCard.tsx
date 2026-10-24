import { useState } from 'react';
import type { HealthReading } from '../../models';

interface HealthReadingCardProps {
  reading: HealthReading;
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  weight: 'Weight',
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatValue(reading: HealthReading) {
  if (reading.type === 'blood_pressure') {
    return `${reading.systolic}/${reading.diastolic}`;
  }
  return String(reading.value);
}

function getUnit(reading: HealthReading) {
  if (reading.type === 'blood_pressure') return 'mmHg';
  if (reading.type === 'blood_sugar') return 'mg/dL';
  return 'kg';
}

function getIconClass(type: string) {
  if (type === 'blood_pressure') return 'bp';
  if (type === 'blood_sugar') return 'bs';
  return 'wt';
}

function MetricIcon({ type }: { type: string }) {
  if (type === 'blood_pressure') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    );
  }
  if (type === 'blood_sugar') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

export function HealthReadingCard({ reading, onDelete }: HealthReadingCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="hr-card">
        <div className={`hr-icon ${getIconClass(reading.type)}`}>
          <MetricIcon type={reading.type} />
        </div>
        <div className="hr-info">
          <div className="hr-type">{TYPE_LABELS[reading.type]}</div>
          <div className="hr-value">
            {formatValue(reading)}{' '}
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {getUnit(reading)}
            </span>
          </div>
          <div className="hr-time">{formatTimestamp(reading.timestamp)}</div>
          {reading.note && <div className="hr-note">"{reading.note}"</div>}
        </div>
        <button
          className="btn-delete"
          onClick={() => setConfirmDelete(true)}
          title="Delete reading"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Delete Reading</h3>
            </div>
            <div className="modal-body">
              Are you sure you want to delete this health reading? This action cannot be undone.
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  onDelete(reading.id);
                  setConfirmDelete(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
