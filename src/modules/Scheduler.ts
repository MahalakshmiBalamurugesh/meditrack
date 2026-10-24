import type { Dose } from '../models/Dose';
import type { Medicine } from '../models/Medicine';
import type { DoseRecord } from '../models/DoseRecord';
import type { DoseClassification, ScheduledDose } from '../models/index';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function classifyDose(
  _dose: Dose,
  _medicine: Medicine,
  nowMinutes: number,
  doseMinutes: number,
  existingRecord?: DoseRecord,
): DoseClassification {
  // 1. If existingRecord exists AND status is 'taken' or 'skipped': return 'completed'
  if (existingRecord && (existingRecord.status === 'taken' || existingRecord.status === 'skipped')) {
    return 'completed';
  }

  // 2. If existingRecord exists AND status is 'missed': return 'completed' (already acted on)
  if (existingRecord && existingRecord.status === 'missed') {
    return 'completed';
  }

  // 3. If doseMinutes > nowMinutes + 10: return 'pending'
  if (doseMinutes > nowMinutes + 10) {
    return 'pending';
  }

  // 4. If nowMinutes < doseMinutes AND (doseMinutes - nowMinutes) <= 10: return 'upcoming'
  if (nowMinutes < doseMinutes && (doseMinutes - nowMinutes) <= 10) {
    return 'upcoming';
  }

  // 5. If nowMinutes >= doseMinutes AND (nowMinutes - doseMinutes) <= 10: return 'due_now'
  if (nowMinutes >= doseMinutes && (nowMinutes - doseMinutes) <= 10) {
    return 'due_now';
  }

  // 6. If (nowMinutes - doseMinutes) > 10: return 'overdue'
  return 'overdue';
}

export function getDailySchedule(
  date: string,
  now: Date,
  doses: Dose[],
  medicines: Medicine[],
  records: DoseRecord[],
): ScheduledDose[] {
  // Filter records to only those matching the given date
  const dateRecords = records.filter((r) => r.date === date);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const scheduled: ScheduledDose[] = [];

  for (const dose of doses) {
    // Find medicine by medicineId — skip if not found
    const medicine = medicines.find((m) => m.id === dose.medicineId);
    if (!medicine) continue;

    // Find existing DoseRecord for (doseId, date) if any
    const existingRecord = dateRecords.find((r) => r.doseId === dose.id);

    // Convert dose.time (HH:MM) to doseMinutes
    const doseMinutes = timeToMinutes(dose.time);

    // Classify the dose
    const classification = classifyDose(dose, medicine, nowMinutes, doseMinutes, existingRecord);

    scheduled.push({ dose, medicine, classification, existingRecord });
  }

  // Sort by dose.time ascending (HH:MM string sort works for 24-hour format)
  scheduled.sort((a, b) => a.dose.time.localeCompare(b.dose.time));

  return scheduled;
}