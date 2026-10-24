import type {
  Medicine,
  Dose,
  DoseRecord,
  DoseRecordFilter,
  HealthReading,
  HealthMetricType,
} from '../models';
import { STORAGE_KEYS } from './keys';
import type { StorageLayer } from './StorageLayer';

export class StorageWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageWriteError';
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, StorageWriteError.prototype);
  }
}

export class LocalStorageLayer implements StorageLayer {
  private readonly onError: (msg: string) => void;

  constructor(onError?: (msg: string) => void) {
    this.onError = onError ?? (() => { /* no-op */ });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private readCollection<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return [];
      return JSON.parse(raw) as T[];
    } catch (err) {
      this.onError(`Failed to read collection at key "${key}": ${String(err)}`);
      return [];
    }
  }

  private writeCollection<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      throw new StorageWriteError(
        `Failed to write collection at key "${key}": ${String(err)}`
      );
    }
  }

  // ── Medicines ──────────────────────────────────────────────────────────────

  getMedicines(): Medicine[] {
    return this.readCollection<Medicine>(STORAGE_KEYS.MEDICINES);
  }

  saveMedicine(medicine: Medicine): void {
    const existing = this.getMedicines();
    const idx = existing.findIndex((m) => m.id === medicine.id);
    if (idx >= 0) {
      existing[idx] = medicine;
    } else {
      existing.push(medicine);
    }
    this.writeCollection(STORAGE_KEYS.MEDICINES, existing);
  }

  deleteMedicine(id: string): void {
    const existing = this.getMedicines();
    const filtered = existing.filter((m) => m.id !== id);
    // Idempotent: if nothing changed, still write (or we could skip — same result)
    if (filtered.length !== existing.length) {
      this.writeCollection(STORAGE_KEYS.MEDICINES, filtered);
    }
  }

  // ── Doses ──────────────────────────────────────────────────────────────────

  getDoses(medicineId?: string): Dose[] {
    const all = this.readCollection<Dose>(STORAGE_KEYS.DOSES);
    if (medicineId === undefined) return all;
    return all.filter((d) => d.medicineId === medicineId);
  }

  saveDose(dose: Dose): void {
    const existing = this.readCollection<Dose>(STORAGE_KEYS.DOSES);
    const idx = existing.findIndex((d) => d.id === dose.id);
    if (idx >= 0) {
      existing[idx] = dose;
    } else {
      existing.push(dose);
    }
    this.writeCollection(STORAGE_KEYS.DOSES, existing);
  }

  deleteDose(id: string): void {
    const existing = this.readCollection<Dose>(STORAGE_KEYS.DOSES);
    const filtered = existing.filter((d) => d.id !== id);
    if (filtered.length !== existing.length) {
      this.writeCollection(STORAGE_KEYS.DOSES, filtered);
    }
  }

  deleteDosesByMedicineId(medicineId: string): void {
    const existing = this.readCollection<Dose>(STORAGE_KEYS.DOSES);
    const filtered = existing.filter((d) => d.medicineId !== medicineId);
    if (filtered.length !== existing.length) {
      this.writeCollection(STORAGE_KEYS.DOSES, filtered);
    }
  }

  // ── DoseRecords ────────────────────────────────────────────────────────────

  getDoseRecords(filter?: DoseRecordFilter): DoseRecord[] {
    const all = this.readCollection<DoseRecord>(STORAGE_KEYS.DOSE_RECORDS);
    if (!filter) return all;

    return all.filter((r) => {
      if (filter.medicineId !== undefined && r.medicineId !== filter.medicineId) {
        return false;
      }
      if (filter.status !== undefined && r.status !== filter.status) {
        return false;
      }
      // Lexicographic string comparison works correctly for YYYY-MM-DD dates
      if (filter.dateStart !== undefined && r.date < filter.dateStart) {
        return false;
      }
      if (filter.dateEnd !== undefined && r.date > filter.dateEnd) {
        return false;
      }
      return true;
    });
  }

  saveDoseRecord(record: DoseRecord): void {
    const existing = this.readCollection<DoseRecord>(STORAGE_KEYS.DOSE_RECORDS);
    const idx = existing.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      existing[idx] = record;
    } else {
      existing.push(record);
    }
    this.writeCollection(STORAGE_KEYS.DOSE_RECORDS, existing);
  }

  deleteDoseRecord(id: string): void {
    const existing = this.readCollection<DoseRecord>(STORAGE_KEYS.DOSE_RECORDS);
    const filtered = existing.filter((r) => r.id !== id);
    if (filtered.length !== existing.length) {
      this.writeCollection(STORAGE_KEYS.DOSE_RECORDS, filtered);
    }
  }

  deleteDoseRecordsByMedicineId(medicineId: string): void {
    const existing = this.readCollection<DoseRecord>(STORAGE_KEYS.DOSE_RECORDS);
    const filtered = existing.filter((r) => r.medicineId !== medicineId);
    if (filtered.length !== existing.length) {
      this.writeCollection(STORAGE_KEYS.DOSE_RECORDS, filtered);
    }
  }

  // ── HealthReadings ─────────────────────────────────────────────────────────

  getHealthReadings(type?: HealthMetricType): HealthReading[] {
    const all = this.readCollection<HealthReading>(STORAGE_KEYS.HEALTH_READINGS);
    if (type === undefined) return all;
    return all.filter((h) => h.type === type);
  }

  saveHealthReading(reading: HealthReading): void {
    const existing = this.readCollection<HealthReading>(STORAGE_KEYS.HEALTH_READINGS);
    const idx = existing.findIndex((h) => h.id === reading.id);
    if (idx >= 0) {
      existing[idx] = reading;
    } else {
      existing.push(reading);
    }
    this.writeCollection(STORAGE_KEYS.HEALTH_READINGS, existing);
  }

  deleteHealthReading(id: string): void {
    const existing = this.readCollection<HealthReading>(STORAGE_KEYS.HEALTH_READINGS);
    const filtered = existing.filter((h) => h.id !== id);
    if (filtered.length !== existing.length) {
      this.writeCollection(STORAGE_KEYS.HEALTH_READINGS, filtered);
    }
  }
}