/**
 * AppDataContext — cloud-backed data layer.
 *
 * All reads/writes go to Firestore under the authenticated user's UID.
 * Data reloads whenever the logged-in user changes.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Medicine, Dose, DoseRecord, HealthReading } from '../models';
import { useAuth } from './AuthContext';
import * as FS from '../storage/FirestoreLayer';

// ── Interface ────────────────────────────────────────────────────

interface AppDataContextValue {
  medicines:     Medicine[];
  doses:         Dose[];
  doseRecords:   DoseRecord[];
  healthReadings: HealthReading[];
  storageError:  string | null;
  loading:       boolean;

  saveMedicine(medicine: Medicine): void;
  deleteMedicine(id: string): void;
  saveDose(dose: Dose): void;
  deleteDose(id: string): void;
  deleteDosesByMedicineId(medicineId: string): void;
  saveDoseRecord(record: DoseRecord): void;
  deleteDoseRecord(id: string): void;
  saveHealthReading(reading: HealthReading): void;
  deleteHealthReading(id: string): void;
  dismissStorageError(): void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [medicines,      setMedicines]      = useState<Medicine[]>([]);
  const [doses,          setDoses]          = useState<Dose[]>([]);
  const [doseRecords,    setDoseRecords]    = useState<DoseRecord[]>([]);
  const [healthReadings, setHealthReadings] = useState<HealthReading[]>([]);
  const [storageError,   setStorageError]   = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);

  // Load all data whenever the authenticated user changes
  useEffect(() => {
    if (!uid) {
      setMedicines([]);
      setDoses([]);
      setDoseRecords([]);
      setHealthReadings([]);
      return;
    }

    setLoading(true);
    Promise.all([
      FS.getMedicines(uid),
      FS.getDoses(uid),
      FS.getDoseRecords(uid),
      FS.getHealthReadings(uid),
    ])
      .then(([meds, dos, recs, readings]) => {
        setMedicines(meds);
        setDoses(dos);
        setDoseRecords(recs);
        setHealthReadings(readings);
      })
      .catch(err => setStorageError(String(err)))
      .finally(() => setLoading(false));
  }, [uid]);

  const handleError = (err: unknown) => {
    setStorageError(err instanceof Error ? err.message : String(err));
  };

  // ── Medicines ──────────────────────────────────────────────────

  function saveMedicine(medicine: Medicine) {
    if (!uid) return;
    FS.saveMedicine(uid, medicine)
      .then(() => setMedicines(prev => {
        const idx = prev.findIndex(m => m.id === medicine.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = medicine; return n; }
        return [...prev, medicine];
      }))
      .catch(handleError);
  }

  function deleteMedicine(id: string) {
    if (!uid) return;
    Promise.all([
      FS.deleteMedicine(uid, id),
      FS.deleteDosesByMedicineId(uid, id),
      FS.deleteDoseRecordsByMedicineId(uid, id),
    ])
      .then(() => {
        setMedicines(prev => prev.filter(m => m.id !== id));
        setDoses(prev => prev.filter(d => d.medicineId !== id));
        setDoseRecords(prev => prev.filter(r => r.medicineId !== id));
      })
      .catch(handleError);
  }

  // ── Doses ──────────────────────────────────────────────────────

  function saveDose(dose: Dose) {
    if (!uid) return;
    FS.saveDose(uid, dose)
      .then(() => setDoses(prev => {
        const idx = prev.findIndex(d => d.id === dose.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = dose; return n; }
        return [...prev, dose];
      }))
      .catch(handleError);
  }

  function deleteDose(id: string) {
    if (!uid) return;
    FS.deleteDose(uid, id)
      .then(() => setDoses(prev => prev.filter(d => d.id !== id)))
      .catch(handleError);
  }

  function deleteDosesByMedicineId(medicineId: string) {
    if (!uid) return;
    FS.deleteDosesByMedicineId(uid, medicineId)
      .then(() => setDoses(prev => prev.filter(d => d.medicineId !== medicineId)))
      .catch(handleError);
  }

  // ── DoseRecords ────────────────────────────────────────────────

  function saveDoseRecord(record: DoseRecord) {
    if (!uid) return;
    // Enforce at-most-one-per-dose-per-date
    const existing = doseRecords.find(
      r => r.doseId === record.doseId && r.date === record.date
    );

    const cleanup = existing
      ? FS.deleteDoseRecord(uid, existing.id)
      : Promise.resolve();

    cleanup
      .then(() => FS.saveDoseRecord(uid, record))
      .then(() => setDoseRecords(prev => {
        const filtered = prev.filter(
          r => !(r.doseId === record.doseId && r.date === record.date)
        );
        return [...filtered, record];
      }))
      .catch(handleError);
  }

  function deleteDoseRecord(id: string) {
    if (!uid) return;
    FS.deleteDoseRecord(uid, id)
      .then(() => setDoseRecords(prev => prev.filter(r => r.id !== id)))
      .catch(handleError);
  }

  // ── HealthReadings ─────────────────────────────────────────────

  function saveHealthReading(reading: HealthReading) {
    if (!uid) return;
    FS.saveHealthReading(uid, reading)
      .then(() => setHealthReadings(prev => {
        const idx = prev.findIndex(h => h.id === reading.id);
        if (idx >= 0) { const n = [...prev]; n[idx] = reading; return n; }
        return [...prev, reading];
      }))
      .catch(handleError);
  }

  function deleteHealthReading(id: string) {
    if (!uid) return;
    FS.deleteHealthReading(uid, id)
      .then(() => setHealthReadings(prev => prev.filter(h => h.id !== id)))
      .catch(handleError);
  }

  function dismissStorageError() {
    setStorageError(null);
  }

  const value: AppDataContextValue = {
    medicines, doses, doseRecords, healthReadings,
    storageError, loading,
    saveMedicine, deleteMedicine,
    saveDose, deleteDose, deleteDosesByMedicineId,
    saveDoseRecord, deleteDoseRecord,
    saveHealthReading, deleteHealthReading,
    dismissStorageError,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
