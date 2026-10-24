import { useMemo } from 'react';
import type { HealthReading } from '../../models';
import { HealthReadingCard } from './HealthReadingCard';

interface Props {
  readings: HealthReading[];
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  weight: 'Weight',
};

export function HealthReadingList({ readings, onDelete }: Props) {
  const grouped = useMemo(() => {
    const bp = readings.filter((r) => r.type === 'blood_pressure');
    const bs = readings.filter((r) => r.type === 'blood_sugar');
    const wt = readings.filter((r) => r.type === 'weight');
    return { blood_pressure: bp, blood_sugar: bs, weight: wt };
  }, [readings]);

  if (readings.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '48px 24px' }}>
        <div className="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2>No Health Readings Yet</h2>
        <p>Add your first reading to start tracking your vitals.</p>
      </div>
    );
  }

  const renderSection = (type: keyof typeof grouped) => {
    const items = [...grouped[type]].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (items.length === 0) return null;
    return (
      <div key={type} style={{ marginBottom: '24px' }}>
        <div className="section-head" style={{ marginTop: 0 }}>
          <div className="section-head-bar" />
          <h3>{TYPE_LABELS[type]}</h3>
          <span className="section-count">{items.length}</span>
        </div>
        {items.map((r) => (
          <HealthReadingCard key={r.id} reading={r} onDelete={onDelete} />
        ))}
      </div>
    );
  };

  return (
    <div>
      {renderSection('blood_pressure')}
      {renderSection('blood_sugar')}
      {renderSection('weight')}
    </div>
  );
}
