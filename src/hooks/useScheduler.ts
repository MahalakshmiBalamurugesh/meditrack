import { useMemo } from 'react';
import { useClock } from './useClock';
import { useAppData } from './useAppData';
import { getDailySchedule } from '../modules/Scheduler';
import type { ScheduledDose } from '../models';

export function useScheduler(): ScheduledDose[] {
  const now = useClock();
  const { medicines, doses, doseRecords } = useAppData();

  // Format today's date as YYYY-MM-DD using local time
  const todayDate = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [now]);

  return useMemo(
    () => getDailySchedule(todayDate, now, doses, medicines, doseRecords),
    [todayDate, now, doses, medicines, doseRecords]
  );
}