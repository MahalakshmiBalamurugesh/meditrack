export type { Medicine, MedicineForm, MedicineColor } from './Medicine';
export { MEDICINE_FORMS, MEDICINE_COLORS } from './Medicine';
export type { Dose } from './Dose';
export type { DoseRecord, DoseStatus } from './DoseRecord';
export type {
  HealthReading,
  BloodPressureReading,
  BloodSugarReading,
  WeightReading,
  HealthMetricType,
  DoseClassification,
} from './HealthReading';

import type { Medicine } from './Medicine';
import type { Dose } from './Dose';
import type { DoseRecord, DoseStatus } from './DoseRecord';
import type { DoseClassification } from './HealthReading';

export interface ScheduledDose {
  dose: Dose;
  medicine: Medicine;
  classification: DoseClassification;
  existingRecord?: DoseRecord;
}

export interface DoseRecordFilter {
  medicineId?: string;
  status?: DoseStatus;
  dateStart?: string; // YYYY-MM-DD inclusive
  dateEnd?: string;   // YYYY-MM-DD inclusive
}

export interface AdherenceResult {
  rate: number;   // integer [0, 100]
  taken: number;
  missed: number;
  skipped: number;
}

export interface WeeklySummary {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string;   // YYYY-MM-DD (Sunday = weekStart + 6 days)
  records: DoseRecord[];
  adherence: AdherenceResult;
}
