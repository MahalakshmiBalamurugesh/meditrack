import type {
  BloodPressureReading,
  BloodSugarReading,
  WeightReading,
} from '../models/HealthReading';

export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Rounds a number to 1 decimal place.
 */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Returns the average blood pressure across all readings,
 * or null if the array is empty.
 */
export function averageBloodPressure(
  readings: BloodPressureReading[]
): { systolic: number; diastolic: number } | null {
  if (readings.length === 0) return null;

  const n = readings.length;
  const sumSystolic = readings.reduce((acc, r) => acc + r.systolic, 0);
  const sumDiastolic = readings.reduce((acc, r) => acc + r.diastolic, 0);

  return {
    systolic: round1(sumSystolic / n),
    diastolic: round1(sumDiastolic / n),
  };
}

/**
 * Returns the average blood sugar value across all readings,
 * or null if the array is empty.
 */
export function averageBloodSugar(
  readings: BloodSugarReading[]
): number | null {
  if (readings.length === 0) return null;

  const n = readings.length;
  const sum = readings.reduce((acc, r) => acc + r.value, 0);
  return round1(sum / n);
}

/**
 * Returns the average weight across all readings,
 * or null if the array is empty.
 */
export function averageWeight(
  readings: WeightReading[]
): number | null {
  if (readings.length === 0) return null;

  const n = readings.length;
  const sum = readings.reduce((acc, r) => acc + r.value, 0);
  return round1(sum / n);
}

/**
 * Given a Monday date string (YYYY-MM-DD), returns the
 * start (Monday) and end (Sunday) of that week.
 * Uses UTC arithmetic to avoid DST issues.
 */
export function computeWeekRange(
  monday: string
): { start: string; end: string } {
  const [y, m, d] = monday.split('-').map(Number);
  const end = new Date(Date.UTC(y, m - 1, d + 6));
  return {
    start: monday,
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Computes a trend direction from an array of numeric values.
 * Returns null if fewer than 2 values are provided.
 * Splits the array in half; odd-length arrays assign the middle
 * value to the second half.
 * - 'up'     if secondAvg > firstAvg + 0.5
 * - 'down'   if secondAvg < firstAvg - 0.5
 * - 'stable' otherwise
 */
export function computeTrend(values: number[]): TrendDirection | null {
  if (values.length < 2) return null;

  const half = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, half);
  const secondHalf = values.slice(half);

  const avg = (arr: number[]) =>
    arr.reduce((acc, v) => acc + v, 0) / arr.length;

  const firstAvg = avg(firstHalf);
  const secondAvg = avg(secondHalf);

  if (secondAvg > firstAvg + 0.5) return 'up';
  if (secondAvg < firstAvg - 0.5) return 'down';
  return 'stable';
}