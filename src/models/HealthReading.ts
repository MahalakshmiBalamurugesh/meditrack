export type HealthMetricType = 'blood_pressure' | 'blood_sugar' | 'weight';

export type DoseClassification =
  | 'upcoming'
  | 'due_now'
  | 'overdue'
  | 'completed'
  | 'pending';

export interface BloodPressureReading {
  id: string;
  type: 'blood_pressure';
  systolic: number;  // integer [60, 250] mmHg
  diastolic: number; // integer [40, 150] mmHg, strictly < systolic
  unit: 'mmHg';
  timestamp: string; // ISO 8601
  note?: string;     // max 200 chars
}

export interface BloodSugarReading {
  id: string;
  type: 'blood_sugar';
  value: number; // [20, 600] mg/dL, ≤1 decimal place
  unit: 'mg/dL';
  timestamp: string;
  note?: string;
}

export interface WeightReading {
  id: string;
  type: 'weight';
  value: number; // [10, 500] kg, ≤1 decimal place
  unit: 'kg';
  timestamp: string;
  note?: string;
}

export type HealthReading =
  | BloodPressureReading
  | BloodSugarReading
  | WeightReading;
