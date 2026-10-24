import type {
  Medicine,
  Dose,
  DoseRecord,
  DoseRecordFilter,
  HealthReading,
  HealthMetricType,
} from '../models';

export type { StorageLayer };

interface StorageLayer {
  // Medicine
  getMedicines(): Medicine[];
  saveMedicine(medicine: Medicine): void;
  deleteMedicine(id: string): void;

  // Dose
  getDoses(medicineId?: string): Dose[];
  saveDose(dose: Dose): void;
  deleteDose(id: string): void;
  deleteDosesByMedicineId(medicineId: string): void;

  // DoseRecord
  getDoseRecords(filter?: DoseRecordFilter): DoseRecord[];
  saveDoseRecord(record: DoseRecord): void;
  deleteDoseRecord(id: string): void;
  deleteDoseRecordsByMedicineId(medicineId: string): void;

  // HealthReading
  getHealthReadings(type?: HealthMetricType): HealthReading[];
  saveHealthReading(reading: HealthReading): void;
  deleteHealthReading(id: string): void;
}
