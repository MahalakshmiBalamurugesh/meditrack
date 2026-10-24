import type { HealthMetricType } from '../../models';

interface MetricTypeSelectorProps {
  selected: HealthMetricType;
  onSelect: (type: HealthMetricType) => void;
}

export function MetricTypeSelector({ selected, onSelect }: MetricTypeSelectorProps) {
  const types: { type: HealthMetricType; label: string }[] = [
    { type: 'blood_pressure', label: 'Blood Pressure' },
    { type: 'blood_sugar', label: 'Blood Sugar' },
    { type: 'weight', label: 'Weight' },
  ];

  return (
    <div className="segmented" style={{ marginBottom: '20px', width: '100%' }}>
      {types.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          className={selected === type ? 'active' : ''}
          onClick={() => onSelect(type)}
          style={{ flex: 1 }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
