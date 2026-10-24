import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useScheduler } from '../hooks/useScheduler';
import { useAppData } from '../context/AppDataContext';
import type { Dose, Medicine, DoseRecord } from '../models';

/* ── helpers ─────────────────────────────────────────────── */
function todayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

function colorAlpha(hex: string, a: number) {
  return hex + Math.round(a * 255).toString(16).padStart(2, '0');
}

/* ── Dose card ────────────────────────────────────────────── */
function DoseCard({
  dose, medicine, existingRecord, classification,
  onTaken, onMissed, onSkip, onUndo, date,
}: {
  dose: Dose; medicine: Medicine; existingRecord?: DoseRecord;
  classification: string;
  onTaken: (doseId: string, date: string) => void;
  onMissed: (doseId: string, date: string) => void;
  onSkip:   (doseId: string, date: string) => void;
  onUndo:   (recordId: string) => void;
  date: string;
}) {
  const cls =
    classification === 'overdue'  ? 'overdue'  :
    classification === 'due_now'  ? 'due-now'  :
    classification === 'upcoming' ? 'upcoming' :
    existingRecord  ? 'completed' : 'later';

  return (
    <div className={`dose-row ${cls}`}>
      <div
        className="dose-color-chip"
        style={{ background: medicine.color, boxShadow: `0 2px 6px ${colorAlpha(medicine.color, 0.35)}` }}
      >
        {medicine.name.slice(0, 2).toUpperCase()}
      </div>

      <div className="dose-info">
        <div className="dose-name">{medicine.name}</div>
        <div className="dose-meta">
          <span className="dose-time-badge">{dose.time}</span>
          <span className="dose-pill">{medicine.dosage}</span>
          <span className="dose-pill">{medicine.form}</span>
          {existingRecord && (
            <span className={`badge badge-${existingRecord.status}`}>
              {existingRecord.status === 'taken'   ? '✓ Taken'   :
               existingRecord.status === 'missed'  ? '✗ Missed'  : '— Skipped'}
            </span>
          )}
        </div>
      </div>

      <div className="dose-actions">
        {!existingRecord || existingRecord.status === 'missed' ? (
          <>
            <button className="btn btn-success btn-sm" onClick={() => onTaken(dose.id, date)}>Taken</button>
            <button className="btn btn-ghost btn-sm"   onClick={() => onMissed(dose.id, date)}>Missed</button>
            <button className="btn btn-ghost btn-sm"   onClick={() => onSkip(dose.id, date)}>Skip</button>
          </>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => onUndo(existingRecord.id)}>Undo</button>
        )}
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────── */
function Section({
  variant, label, items, onTaken, onMissed, onSkip, onUndo, date,
}: {
  variant: string; label: string;
  items: ReturnType<typeof useScheduler>;
  onTaken: (d: string, date: string) => void;
  onMissed: (d: string, date: string) => void;
  onSkip:   (d: string, date: string) => void;
  onUndo:   (id: string) => void;
  date: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className={`divider-title ${variant}`}>
        <div className="divider-title-bar" />
        <h3>{label}</h3>
        <span className="count-pill">{items.length}</span>
      </div>
      {items.map(({ dose, medicine, existingRecord, classification }) => (
        <DoseCard
          key={dose.id}
          dose={dose} medicine={medicine}
          existingRecord={existingRecord}
          classification={classification}
          onTaken={onTaken} onMissed={onMissed}
          onSkip={onSkip}   onUndo={onUndo}
          date={date}
        />
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export function TodayPage() {
  const scheduled = useScheduler();
  const { saveDoseRecord, deleteDoseRecord } = useAppData();
  const date = useMemo(todayStr, []);

  const cats = useMemo(() => {
    const g = { overdue: [] as typeof scheduled, dueNow: [] as typeof scheduled,
                 upcoming: [] as typeof scheduled, pending: [] as typeof scheduled,
                 completed: [] as typeof scheduled };
    for (const s of scheduled) {
      if      (s.classification === 'overdue')  g.overdue.push(s);
      else if (s.classification === 'due_now')   g.dueNow.push(s);
      else if (s.classification === 'upcoming')  g.upcoming.push(s);
      else if (s.classification === 'pending')   g.pending.push(s);
      else                                        g.completed.push(s);
    }
    return g;
  }, [scheduled]);

  const mkRecord = (doseId: string, status: 'taken'|'missed'|'skipped') => {
    const s = scheduled.find(x => x.dose.id === doseId);
    if (!s) return;
    saveDoseRecord({ id: crypto.randomUUID(), doseId, medicineId: s.medicine.id,
                     date, status, timestamp: new Date().toISOString() });
  };

  if (scheduled.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="empty-title">No doses scheduled today</div>
        <div className="empty-desc">
          Add your first medicine to start tracking your daily medication schedule.
        </div>
        <Link to="/medicines" className="btn btn-primary btn-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Your First Medicine
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon-wrap red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{cats.overdue.length}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{cats.dueNow.length}</div>
            <div className="stat-label">Due Now</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap teal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{cats.upcoming.length + cats.pending.length}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{cats.completed.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-head-title">Today's Schedule</div>
            <div className="card-head-sub">{scheduled.length} dose{scheduled.length !== 1 ? 's' : ''} total</div>
          </div>
        </div>
        <div className="card-body">
          <Section variant="overdue"  label="Overdue"      items={cats.overdue}   onTaken={d => mkRecord(d,'taken')} onMissed={d => mkRecord(d,'missed')} onSkip={d => mkRecord(d,'skipped')} onUndo={deleteDoseRecord} date={date} />
          <Section variant="due-now" label="Due Now"      items={cats.dueNow}    onTaken={d => mkRecord(d,'taken')} onMissed={d => mkRecord(d,'missed')} onSkip={d => mkRecord(d,'skipped')} onUndo={deleteDoseRecord} date={date} />
          <Section variant="upcoming" label="Upcoming"     items={cats.upcoming}  onTaken={d => mkRecord(d,'taken')} onMissed={d => mkRecord(d,'missed')} onSkip={d => mkRecord(d,'skipped')} onUndo={deleteDoseRecord} date={date} />
          <Section variant="later"    label="Later Today"  items={cats.pending}   onTaken={d => mkRecord(d,'taken')} onMissed={d => mkRecord(d,'missed')} onSkip={d => mkRecord(d,'skipped')} onUndo={deleteDoseRecord} date={date} />
          <Section variant="done"     label="Completed"    items={cats.completed} onTaken={d => mkRecord(d,'taken')} onMissed={d => mkRecord(d,'missed')} onSkip={d => mkRecord(d,'skipped')} onUndo={deleteDoseRecord} date={date} />
        </div>
      </div>
    </div>
  );
}
