import { MedicineColorBadge } from '../shared/MedicineColorBadge';
import type { ScheduledDose } from '../../models';
import { DoseStatusBadge } from './DoseStatusBadge';
import { DoseTimeLabel } from './DoseTimeLabel';
import { Button } from '../shared/Button';

interface DoseCardProps {
  scheduledDose: ScheduledDose;
  onMarkTaken: (doseId: string, date: string) => void;
  onMarkMissed: (doseId: string, date: string) => void;
  onSkip: (doseId: string, date: string) => void;
  onUndo: (recordId: string) => void;
}

export function DoseCard({ scheduledDose, onMarkTaken, onMarkMissed, onSkip, onUndo }: DoseCardProps) {
  const { dose, medicine, classification, existingRecord } = scheduledDose;
  const isCompleted = existingRecord && ['taken', 'skipped'].includes(existingRecord.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex items-start space-x-3">
        <MedicineColorBadge color={medicine.color} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-medium text-gray-900">{medicine.name}</h3>
            <DoseStatusBadge classification={classification} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{medicine.dosage}</p>
          <DoseTimeLabel time={dose.time} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center space-x-2">
        {existingRecord ? (
          <Button
            variant="secondary"
            onClick={() => onUndo(existingRecord.id)}
            disabled={existingRecord.status === 'missed'}
          >
            Undo
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={() => onMarkTaken(dose.id, scheduledDose.dose.id)}
              disabled={isCompleted}
            >
              Taken
            </Button>
            <Button
              variant="danger"
              onClick={() => onMarkMissed(dose.id, scheduledDose.dose.id)}
              disabled={isCompleted}
            >
              Missed
            </Button>
            <Button
              variant="secondary"
              onClick={() => onSkip(dose.id, scheduledDose.dose.id)}
              disabled={isCompleted}
            >
              Skip
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
