import type { DoseRecord } from '../models/DoseRecord';
import type { DoseRecordFilter } from '../models/index';

/**
 * FilterEngine — pure, side-effect-free filtering utilities.
 * All filter conditions are ANDed; undefined/missing fields are ignored.
 */
export function filterDoseRecords(
  records: DoseRecord[],
  filter: DoseRecordFilter,
): DoseRecord[] {
  return records.filter((record) => {
    if (filter.medicineId !== undefined && record.medicineId !== filter.medicineId) {
      return false;
    }
    if (filter.status !== undefined && record.status !== filter.status) {
      return false;
    }
    if (filter.dateStart !== undefined && record.date < filter.dateStart) {
      return false;
    }
    if (filter.dateEnd !== undefined && record.date > filter.dateEnd) {
      return false;
    }
    return true;
  });
}