import type { Medicine, MedicineForm, MedicineColor } from '../models/Medicine';
import { MEDICINE_FORMS, MEDICINE_COLORS } from '../models/Medicine';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ok<T>(value: T): ValidationResult<T> {
  return { ok: true, value };
}

function fail<T>(errors: string[]): ValidationResult<T> {
  return { ok: false, errors };
}

function hasAtMostOneDecimalPlace(value: number): boolean {
  return Number.isFinite(value) && Math.round(value * 10) === value * 10;
}

// ---------------------------------------------------------------------------
// Medicine validation
// ---------------------------------------------------------------------------

export function validateMedicineName(name: string): ValidationResult<string> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return fail(['Name must not be empty.']);
  }
  if (trimmed.length > 200) {
    return fail(['Name must be 200 characters or fewer.']);
  }
  return ok(trimmed);
}

export function validateDosage(dosage: string): ValidationResult<string> {
  // Pattern: number (with optional decimal), a space, then a non-whitespace unit
  const pattern = /^\d+(\.\d+)?\s+\S+$/;
  if (!pattern.test(dosage)) {
    return fail([
      'Dosage must be a number followed by a space and a unit (e.g. "500 mg", "0.5 mL").',
    ]);
  }
  return ok(dosage);
}

export function validateMedicineForm(form: string): ValidationResult<MedicineForm> {
  if ((MEDICINE_FORMS as string[]).includes(form)) {
    return ok(form as MedicineForm);
  }
  return fail([`Form must be one of: ${MEDICINE_FORMS.join(', ')}.`]);
}

export function validateMedicineColor(color: string): ValidationResult<MedicineColor> {
  if ((MEDICINE_COLORS as string[]).includes(color)) {
    return ok(color as MedicineColor);
  }
  return fail([`Color must be one of: ${MEDICINE_COLORS.join(', ')}.`]);
}

export function validateMedicineNotes(notes: string): ValidationResult<string> {
  if (notes.length > 500) {
    return fail(['Notes must be 500 characters or fewer.']);
  }
  return ok(notes);
}

export function validateMedicine(
  input: unknown,
): ValidationResult<Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>> {
  const errors: string[] = [];

  // Guard: must be a non-null object
  if (typeof input !== 'object' || input === null) {
    return fail(['Input must be an object.']);
  }

  const raw = input as Record<string, unknown>;

  // name
  let name = '';
  if (typeof raw['name'] !== 'string') {
    errors.push('Name must be a string.');
  } else {
    const nameResult = validateMedicineName(raw['name']);
    if (!nameResult.ok) {
      errors.push(...nameResult.errors);
    } else {
      name = nameResult.value;
    }
  }

  // dosage
  let dosage = '';
  if (typeof raw['dosage'] !== 'string') {
    errors.push('Dosage must be a string.');
  } else {
    const dosageResult = validateDosage(raw['dosage']);
    if (!dosageResult.ok) {
      errors.push(...dosageResult.errors);
    } else {
      dosage = dosageResult.value;
    }
  }

  // form
  let form: MedicineForm = 'other';
  if (typeof raw['form'] !== 'string') {
    errors.push('Form must be a string.');
  } else {
    const formResult = validateMedicineForm(raw['form']);
    if (!formResult.ok) {
      errors.push(...formResult.errors);
    } else {
      form = formResult.value;
    }
  }

  // color
  let color: MedicineColor = 'white';
  if (typeof raw['color'] !== 'string') {
    errors.push('Color must be a string.');
  } else {
    const colorResult = validateMedicineColor(raw['color']);
    if (!colorResult.ok) {
      errors.push(...colorResult.errors);
    } else {
      color = colorResult.value;
    }
  }

  // notes (optional field)
  let notes: string | undefined;
  if (raw['notes'] !== undefined) {
    if (typeof raw['notes'] !== 'string') {
      errors.push('Notes must be a string.');
    } else {
      const notesResult = validateMedicineNotes(raw['notes']);
      if (!notesResult.ok) {
        errors.push(...notesResult.errors);
      } else {
        notes = notesResult.value || undefined;
      }
    }
  }

  if (errors.length > 0) {
    return fail(errors);
  }

  const result: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'> = {
    name,
    dosage,
    form,
    color,
    ...(notes !== undefined ? { notes } : {}),
  };

  return ok(result);
}

// ---------------------------------------------------------------------------
// Dose / Schedule validation
// ---------------------------------------------------------------------------

export function validateDoseTime(time: string): ValidationResult<string> {
  const pattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!pattern.test(time)) {
    return fail([
      'Time must be in HH:MM 24-hour format (e.g. "08:30", "23:59").',
    ]);
  }
  return ok(time);
}

export function validateNoDuplicateTimes(times: string[]): ValidationResult<string[]> {
  const seen = new Set<string>();
  for (const t of times) {
    if (seen.has(t)) {
      return fail([`Duplicate time detected: "${t}". Each dose time must be unique.`]);
    }
    seen.add(t);
  }
  return ok(times);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function checkProximityWarning(times: string[]): string[] {
  const warnings: string[] = [];
  for (let i = 0; i < times.length; i++) {
    for (let j = i + 1; j < times.length; j++) {
      const a = times[i]!;
      const b = times[j]!;
      const diff = Math.abs(timeToMinutes(a) - timeToMinutes(b));
      if (diff > 0 && diff < 15) {
        warnings.push(`Times "${a}" and "${b}" are less than 15 minutes apart.`);
      }
    }
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Health reading validation
// ---------------------------------------------------------------------------

export function validateBloodPressure(
  systolic: number,
  diastolic: number,
): ValidationResult<{ systolic: number; diastolic: number }> {
  const errors: string[] = [];

  if (!Number.isInteger(systolic) || systolic < 60 || systolic > 250) {
    errors.push('Systolic pressure must be an integer between 60 and 250 mmHg.');
  }
  if (!Number.isInteger(diastolic) || diastolic < 40 || diastolic > 150) {
    errors.push('Diastolic pressure must be an integer between 40 and 150 mmHg.');
  }
  // Only check relationship if both values are individually valid
  if (errors.length === 0 && systolic <= diastolic) {
    errors.push('Systolic pressure must be greater than diastolic pressure.');
  }

  if (errors.length > 0) {
    return fail(errors);
  }
  return ok({ systolic, diastolic });
}

export function validateBloodSugar(value: number): ValidationResult<number> {
  const errors: string[] = [];

  if (!Number.isFinite(value) || value < 20 || value > 600) {
    errors.push('Blood sugar must be between 20 and 600 mg/dL.');
  }
  if (!hasAtMostOneDecimalPlace(value)) {
    errors.push('Blood sugar must have at most 1 decimal place.');
  }

  if (errors.length > 0) {
    return fail(errors);
  }
  return ok(value);
}

export function validateWeight(value: number): ValidationResult<number> {
  const errors: string[] = [];

  if (!Number.isFinite(value) || value < 10 || value > 500) {
    errors.push('Weight must be between 10 and 500 kg.');
  }
  if (!hasAtMostOneDecimalPlace(value)) {
    errors.push('Weight must have at most 1 decimal place.');
  }

  if (errors.length > 0) {
    return fail(errors);
  }
  return ok(value);
}

export function validateHealthNote(note: string): ValidationResult<string> {
  if (note.length > 200) {
    return fail(['Health note must be 200 characters or fewer.']);
  }
  return ok(note);
}
