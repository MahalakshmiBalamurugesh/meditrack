import type { DoseRecord } from '../models/DoseRecord';
import type { AdherenceResult } from '../models';

/**
 * Calculates medication adherence statistics from dose records.
 */
export const AdherenceCalculator = {
  /**
   * Calculates adherence from an array of DoseRecord entries.
   *
   * denominator = taken + missed (skipped doses are excluded from the rate)
   * rate = floor((taken / denominator) * 100), or 0 when denominator is 0
   * Invariant: rate is always in [0, 100]
   */
  calculateAdherence(records: DoseRecord[]): AdherenceResult {
    let taken = 0;
    let missed = 0;
    let skipped = 0;

    for (const record of records) {
      if (record.status === 'taken') taken++;
      else if (record.status === 'missed') missed++;
      else if (record.status === 'skipped') skipped++;
    }

    const denominator = taken + missed;
    const rate = denominator === 0 ? 0 : Math.floor((taken / denominator) * 100);

    return { rate, taken, missed, skipped };
  },

  /**
   * Calculates adherence for records that fall within the given date range (inclusive).
   *
   * @param records  - Full set of DoseRecord entries
   * @param start    - Start date string YYYY-MM-DD (inclusive)
   * @param end      - End date string YYYY-MM-DD (inclusive)
   */
  calculateAdherenceForDateRange(
    records: DoseRecord[],
    start: string,
    end: string,
  ): AdherenceResult {
    const filtered = records.filter(
      (r) => r.date >= start && r.date <= end,
    );
    return this.calculateAdherence(filtered);
  },
};