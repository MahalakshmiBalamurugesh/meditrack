import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { AdherenceCalculator, filterDoseRecords } from '../modules';
import type { DoseStatus, DoseRecordFilter, Medicine } from '../models';

function fmt(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function startOfWeek(offset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

const STATUS_LABEL: Record<DoseStatus, string> = {
  taken: '✓ Taken', missed: '✗ Missed', skipped: '— Skipped',
};

const STATUS_CLS: Record<DoseStatus, string> = {
  taken: 'badge-taken', missed: 'badge-missed', skipped: 'badge-skipped',
};

export function WeeklySummaryPage() {
  const { doseRecords, medicines } = useAppData();
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<DoseRecordFilter>({});

  const weekStart = useMemo(() => startOfWeek(offset), [offset]);
  const weekEnd   = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate()+6); return d; }, [weekStart]);

  const weekRecords = useMemo(() =>
    doseRecords.filter(r => {
      const d = new Date(r.date + 'T00:00:00');
      return d >= weekStart && d <= weekEnd;
    }), [doseRecords, weekStart, weekEnd]);

  const filtered   = useMemo(() => filterDoseRecords(weekRecords, filter), [weekRecords, filter]);
  const adherence  = useMemo(() => AdherenceCalculator.calculateAdherence(filtered), [filtered]);

  const medMap = useMemo(() => {
    const m = new Map<string, Medicine>();
    medicines.forEach(med => m.set(med.id, med));
    return m;
  }, [medicines]);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach(r => {
      if (!map.has(r.date)) map.set(r.date, []);
      map.get(r.date)!.push(r);
    });
    return Array.from(map.entries())
      .sort(([a],[b]) => new Date(b+'T00:00:00').getTime() - new Date(a+'T00:00:00').getTime());
  }, [filtered]);

  const hasFilter = !!(filter.medicineId || filter.status || filter.dateStart);

  return (
    <div>
      <div className="row-between mb-6">
        <div>
          <div className="page-title">Weekly Summary</div>
          <div className="page-sub">Medication adherence report</div>
        </div>
        <span className="badge badge-info">{filtered.length} records</span>
      </div>

      {/* Week selector */}
      <div className="week-sel">
        <span className="week-range">{fmt(weekStart)} — {fmt(weekEnd)}, {weekStart.getFullYear()}</span>
        <div className="row gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => setOffset(o => o-1)}>← Prev</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setOffset(o => o+1)}>Next →</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{adherence.taken}</div>
            <div className="stat-label">Taken</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{adherence.missed}</div>
            <div className="stat-label">Missed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap gray">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{adherence.skipped}</div>
            <div className="stat-label">Skipped</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{adherence.rate}%</div>
            <div className="stat-label">Adherence</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-bar-head">
          <span className="filter-bar-title">Filters</span>
          {hasFilter && (
            <button className="filter-clear" onClick={() => setFilter({})}>Clear filters</button>
          )}
        </div>
        <div className="filter-bar-grid">
          <div className="field" style={{ marginBottom:0 }}>
            <label className="field-label">Medicine</label>
            <select className="field-select" value={filter.medicineId || ''}
              onChange={e => setFilter(f => ({ ...f, medicineId: e.target.value || undefined }))}>
              <option value="">All medicines</option>
              {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom:0 }}>
            <label className="field-label">Status</label>
            <select className="field-select" value={filter.status || ''}
              onChange={e => setFilter(f => ({ ...f, status: (e.target.value as DoseStatus) || undefined }))}>
              <option value="">All statuses</option>
              <option value="taken">Taken</option>
              <option value="missed">Missed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom:0 }}>
            <label className="field-label">Date</label>
            <input type="date" className="field-input" value={filter.dateStart || ''}
              onChange={e => {
                const v = e.target.value;
                setFilter(f => ({ ...f, dateStart: v || undefined, dateEnd: v || undefined }));
              }} />
          </div>
        </div>
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding:'48px 24px' }}>
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-8"/>
              </svg>
            </div>
            <div className="empty-title">No records found</div>
            <div className="empty-desc">Try adjusting your filters, or check a different week.</div>
          </div>
        </div>
      ) : (
        byDate.map(([date, records]) => {
          const label = new Date(date+'T00:00:00').toLocaleDateString('en-US', {
            weekday:'long', month:'long', day:'numeric'
          });
          return (
            <div key={date} style={{ marginBottom:'24px' }}>
              <div className="record-date-head">{label}</div>
              {records.map(r => {
                const med = medMap.get(r.medicineId);
                if (!med) return null;
                return (
                  <div key={r.id} className="record-row">
                    <div className="record-swatch" style={{ background: med.color+'1a' }}>
                      <div className="record-dot" style={{ background: med.color }} />
                    </div>
                    <div className="record-info">
                      <div className="record-name">{med.name}</div>
                      <div className="record-meta">{med.dosage} · {med.form}</div>
                    </div>
                    <span className={`badge ${STATUS_CLS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
