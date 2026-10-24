import { useMemo } from 'react';
import type { DoseRecord, Medicine, DoseStatus, AdherenceResult, DoseRecordFilter } from '../../models/index';

// ── WeekSelector ─────────────────────────────────────────────────────────────

interface WeekSelectorProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeekSelector({ weekStart, onPrevWeek, onNextWeek }: WeekSelectorProps) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="text-lg font-medium text-gray-900">
        Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevWeek}
          disabled={weekStart.getDate() < 2}
          className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          ← Prev
        </button>
        <button
          onClick={onNextWeek}
          className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── SummaryStatsBar ──────────────────────────────────────────────────────────

interface SummaryStatsBarProps {
  adherence: AdherenceResult;
}

export function SummaryStatsBar({ adherence }: SummaryStatsBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 grid grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{adherence.taken}</div>
        <div className="text-xs text-gray-600">Taken</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{adherence.missed}</div>
        <div className="text-xs text-gray-600">Missed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">{adherence.skipped}</div>
        <div className="text-xs text-gray-600">Skipped</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{adherence.rate}%</div>
        <div className="text-xs text-gray-600">Adherence</div>
      </div>
    </div>
  );
}

// ── FilterPanel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  medicines: Medicine[];
  filter: DoseRecordFilter;
  onChange: (filter: DoseRecordFilter) => void;
}

export function FilterPanel({ medicines, filter, onChange }: FilterPanelProps) {
  const handleMedicineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filter,
      medicineId: e.target.value || undefined,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filter,
      status: e.target.value as DoseStatus || undefined,
    });
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date) {
      onChange({
        ...filter,
        dateStart: date,
        dateEnd: date,
      });
    }
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {(filter.medicineId || filter.status || filter.dateStart) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Medicine
          </label>
          <select
            value={filter.medicineId || ''}
            onChange={handleMedicineChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All medicines</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filter.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="taken">Taken</option>
            <option value="missed">Missed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={filter.dateStart || ''}
            onChange={handleDateRangeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// ── DoseRecordRow ────────────────────────────────────────────────────────────

interface DoseRecordRowProps {
  record: DoseRecord;
  medicine: Medicine;
}

export function DoseRecordRow({ record, medicine }: DoseRecordRowProps) {
  const statusLabels: Record<DoseStatus, string> = {
    taken: 'Taken',
    missed: 'Missed',
    skipped: 'Skipped',
  };

  const statusColors: Record<DoseStatus, string> = {
    taken: 'bg-green-100 text-green-800',
    missed: 'bg-red-100 text-red-800',
    skipped: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: medicine.color }}
        />
        <div>
          <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
          <div className="text-xs text-gray-600">
            {formatDate(record.date)} • {statusLabels[record.status]}
          </div>
        </div>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[record.status]}`}>
        {statusLabels[record.status]}
      </span>
    </div>
  );
}

// ── FilteredDoseRecordList ───────────────────────────────────────────────────

interface FilteredDoseRecordListProps {
  records: DoseRecord[];
  medicines: Medicine[];
}

export function FilteredDoseRecordList({ records, medicines }: FilteredDoseRecordListProps) {
  const medicinesMap = useMemo(() => {
    const map = new Map<string, Medicine>();
    medicines.forEach((m) => map.set(m.id, m));
    return map;
  }, [medicines]);

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No dose records found</h3>
        <p className="text-gray-600">
          Try adjusting your filters to see more records.
        </p>
      </div>
    );
  }

  // Group by date
  const recordsByDate = new Map<string, DoseRecord[]>();
  records.forEach((record) => {
    const date = record.date;
    if (!recordsByDate.has(date)) {
      recordsByDate.set(date, []);
    }
    recordsByDate.get(date)!.push(record);
  });

  // Sort dates descending
  const sortedDates = Array.from(recordsByDate.keys()).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div>
      {sortedDates.map((date) => (
        <div key={date} className="mb-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </h3>
          {recordsByDate.get(date)!.map((record) => (
            <DoseRecordRow
              key={record.id}
              record={record}
              medicine={medicinesMap.get(record.medicineId)!}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
