import type { Medicine } from '../../models';

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: medicine.color }}
          />
          <div>
            <h3 className="font-medium text-gray-900">{medicine.name}</h3>
            <p className="text-sm text-gray-600">
              {medicine.dosage} {medicine.form}
            </p>
          </div>
        </div>
      </div>
      {medicine.notes && (
        <p className="text-sm text-gray-600 mt-2 italic">"{medicine.notes}"</p>
      )}
    </div>
  );
}
