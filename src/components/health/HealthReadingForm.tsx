import { useState } from 'react';
import { validateBloodPressure, validateBloodSugar, validateWeight } from '../../modules';
import { MetricTypeSelector } from './MetricTypeSelector';
import type { HealthReading, HealthMetricType } from '../../models';

interface FormData {
  type: HealthMetricType;
  systolic?: number;
  diastolic?: number;
  value?: number;
  note: string;
}

export function HealthReadingForm({ onSave }: { onSave: (reading: HealthReading) => void }) {
  const [formData, setFormData] = useState<FormData>({ type: 'blood_pressure', note: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeChange = (type: HealthMetricType) => {
    setFormData({ type, note: formData.note });
    setErrors({});
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (formData.type === 'blood_pressure') {
      const r = validateBloodPressure(formData.systolic || 0, formData.diastolic || 0);
      if (!r.ok) {
        r.errors.forEach((e: string) => {
          if (e.includes('systolic') && !e.includes('diastolic')) newErrors.systolic = e;
          else if (e.includes('diastolic')) newErrors.diastolic = e;
        });
      }
    } else if (formData.type === 'blood_sugar') {
      const r = validateBloodSugar(formData.value || 0);
      if (!r.ok) r.errors.forEach((e: string) => { newErrors.value = e; });
    } else {
      const r = validateWeight(formData.value || 0);
      if (!r.ok) r.errors.forEach((e: string) => { newErrors.value = e; });
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    let reading: HealthReading;
    if (formData.type === 'blood_pressure') {
      reading = {
        id: crypto.randomUUID(),
        type: 'blood_pressure',
        systolic: formData.systolic!,
        diastolic: formData.diastolic!,
        unit: 'mmHg',
        timestamp: new Date().toISOString(),
        note: formData.note || undefined,
      };
    } else if (formData.type === 'blood_sugar') {
      reading = {
        id: crypto.randomUUID(),
        type: 'blood_sugar',
        value: formData.value!,
        unit: 'mg/dL',
        timestamp: new Date().toISOString(),
        note: formData.note || undefined,
      };
    } else {
      reading = {
        id: crypto.randomUUID(),
        type: 'weight',
        value: formData.value!,
        unit: 'kg',
        timestamp: new Date().toISOString(),
        note: formData.note || undefined,
      };
    }

    onSave(reading);
    setFormData({ type: 'blood_pressure', note: '' });
  };

  return (
    <div>
      <MetricTypeSelector selected={formData.type} onSelect={handleTypeChange} />

      {formData.type === 'blood_pressure' && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Systolic (mmHg)</label>
            <input
              type="number"
              className={`form-input ${errors.systolic ? 'error' : ''}`}
              value={formData.systolic || ''}
              onChange={(e) => handleChange('systolic', parseInt(e.target.value) || 0)}
              placeholder="e.g., 120"
              min={60}
              max={250}
            />
            {errors.systolic && <p className="form-error">{errors.systolic}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Diastolic (mmHg)</label>
            <input
              type="number"
              className={`form-input ${errors.diastolic ? 'error' : ''}`}
              value={formData.diastolic || ''}
              onChange={(e) => handleChange('diastolic', parseInt(e.target.value) || 0)}
              placeholder="e.g., 80"
              min={40}
              max={150}
            />
            {errors.diastolic && <p className="form-error">{errors.diastolic}</p>}
          </div>
        </div>
      )}

      {(formData.type === 'blood_sugar' || formData.type === 'weight') && (
        <div className="form-group">
          <label className="form-label">
            {formData.type === 'blood_sugar' ? 'Blood Sugar (mg/dL)' : 'Weight (kg)'}
          </label>
          <input
            type="number"
            step={formData.type === 'weight' ? '0.1' : undefined}
            className={`form-input ${errors.value ? 'error' : ''}`}
            value={formData.value || ''}
            onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
            placeholder={formData.type === 'weight' ? 'e.g., 70.5' : 'e.g., 90'}
          />
          {errors.value && <p className="form-error">{errors.value}</p>}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <textarea
          className="form-textarea"
          value={formData.note}
          onChange={(e) => handleChange('note', e.target.value)}
          rows={2}
          placeholder="Any additional notes..."
          maxLength={200}
        />
        <p className="form-hint">{formData.note.length}/200 characters</p>
      </div>

      <button className="btn btn-primary btn-full" onClick={handleSave}>
        Save Reading
      </button>
    </div>
  );
}
