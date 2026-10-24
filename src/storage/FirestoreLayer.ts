/**
 * FirestoreLayer — cloud storage for a single authenticated user.
 *
 * Data structure in Firestore:
 *   users/{uid}/medicines/{medicineId}
 *   users/{uid}/doses/{doseId}
 *   users/{uid}/doseRecords/{recordId}
 *   users/{uid}/healthReadings/{readingId}
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Medicine, Dose, DoseRecord, HealthReading } from '../models';

function col(uid: string, name: string) {
  return collection(db, 'users', uid, name);
}

function docRef(uid: string, name: string, id: string) {
  return doc(db, 'users', uid, name, id);
}

/**
 * Firestore rejects `undefined` field values.
 * This helper removes any key whose value is `undefined`
 * before writing to the database.
 */
function sanitize<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }
  return clean as T;
}

// ── Medicines ────────────────────────────────────────────────────

export async function getMedicines(uid: string): Promise<Medicine[]> {
  const snap = await getDocs(col(uid, 'medicines'));
  return snap.docs.map(d => d.data() as Medicine);
}

export async function saveMedicine(uid: string, medicine: Medicine): Promise<void> {
  await setDoc(docRef(uid, 'medicines', medicine.id), sanitize(medicine));
}

export async function deleteMedicine(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, 'medicines', id));
}

// ── Doses ────────────────────────────────────────────────────────

export async function getDoses(uid: string): Promise<Dose[]> {
  const snap = await getDocs(col(uid, 'doses'));
  return snap.docs.map(d => d.data() as Dose);
}

export async function saveDose(uid: string, dose: Dose): Promise<void> {
  await setDoc(docRef(uid, 'doses', dose.id), sanitize(dose));
}

export async function deleteDose(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, 'doses', id));
}

export async function deleteDosesByMedicineId(uid: string, medicineId: string): Promise<void> {
  const q = query(col(uid, 'doses'), where('medicineId', '==', medicineId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ── DoseRecords ──────────────────────────────────────────────────

export async function getDoseRecords(uid: string): Promise<DoseRecord[]> {
  const snap = await getDocs(col(uid, 'doseRecords'));
  return snap.docs.map(d => d.data() as DoseRecord);
}

export async function saveDoseRecord(uid: string, record: DoseRecord): Promise<void> {
  await setDoc(docRef(uid, 'doseRecords', record.id), sanitize(record));
}

export async function deleteDoseRecord(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, 'doseRecords', id));
}

export async function deleteDoseRecordsByMedicineId(uid: string, medicineId: string): Promise<void> {
  const q = query(col(uid, 'doseRecords'), where('medicineId', '==', medicineId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ── HealthReadings ───────────────────────────────────────────────

export async function getHealthReadings(uid: string): Promise<HealthReading[]> {
  const snap = await getDocs(col(uid, 'healthReadings'));
  return snap.docs.map(d => d.data() as HealthReading);
}

export async function saveHealthReading(uid: string, reading: HealthReading): Promise<void> {
  await setDoc(docRef(uid, 'healthReadings', reading.id), sanitize(reading));
}

export async function deleteHealthReading(uid: string, id: string): Promise<void> {
  await deleteDoc(docRef(uid, 'healthReadings', id));
}
