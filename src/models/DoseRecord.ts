export type DoseStatus = 'taken' | 'missed' | 'skipped';

export interface DoseRecord {
  id: string;
  doseId: string;
  medicineId: string; // denormalized FK for query convenience
  date: string;       // YYYY-MM-DD
  status: DoseStatus;
  timestamp?: string; // ISO 8601 — present for 'taken' status
}
