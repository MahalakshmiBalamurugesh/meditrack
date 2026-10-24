import type { ScheduledDose } from '../../models';
import { DoseCard } from './DoseCard';

interface DoseListProps {
  scheduledDoses: ScheduledDose[];
  onMarkTaken: (doseId: string, date: string) => void;
  onMarkMissed: (doseId: string, date: string) => void;
  onSkip: (doseId: string, date: string) => void;
  onUndo: (recordId: string) => void;
}

export function DoseList({ scheduledDoses, onMarkTaken, onMarkMissed, onSkip, onUndo }: DoseListProps) {
  return (
    <div>
      {scheduledDoses.map((scheduledDose) => (
        <DoseCard
          key={scheduledDose.dose.id}
          scheduledDose={scheduledDose}
          onMarkTaken={onMarkTaken}
          onMarkMissed={onMarkMissed}
          onSkip={onSkip}
          onUndo={onUndo}
        />
      ))}
    </div>
  );
}
