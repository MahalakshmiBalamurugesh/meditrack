import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { validateBloodPressure, validateBloodSugar, validateWeight } from '../modules';
import type { HealthReading, HealthMetricType } from '../models';

/* ── Icons ───────────────────────────────────────────────── */
const BpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);
const BsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const WtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3"/>
    <path d="M6.25 17.5a6.25 6.25 0 0 1 11.5 0"/>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);

/* ── Reading card ────────────────────────────────────────── */
function ReadingCard({ reading, onDelete }: { reading: HealthReading; onDelete(id:string): void }) {
  const [confirm, setConfirm] = useState(false);

  const fmtVal = () => {
    if (reading.type === 'blood_pressure') return `${reading.systolic}/${reading.diastolic}`;
    return String(reading.value);
  };
  const unit = reading.type === 'blood_pressure' ? 'mmHg' : reading.type === 'blood_sugar' ? 'mg/dL' : 'kg';
  const iconCls = reading.type === 'blood_pressure' ? 'bp' : reading.type === 'blood_sugar' ? 'bs' : 'wt';
  const Icon = reading.type === 'blood_pressure' ? BpIcon : reading.type === 'blood_sugar' ? BsIcon : WtIcon;
  const typeLabel = reading.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  const dt = new Date(reading.timestamp).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' });

  return (
    <>
      <div className="reading-card">
        <div className={`reading-icon ${iconCls}`}><Icon /></div>
        <div className="reading-info">
          <div className="reading-type">{typeLabel}</div>
          <div className="reading-value">
            {fmtVal()} <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--c-text-3)' }}>{unit}</span>
          </div>
          <div className="reading-time">{dt}</div>
          {reading.note && <div className="reading-note">"{reading.note}"</div>}
        </div>
        <button className="btn-icon-only" title="Delete" onClick={() => setConfirm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>

      {confirm && (
        <div className="modal-bg" onClick={() => setConfirm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><div className="modal-title">Delete Reading</div></div>
            <div className="modal-body">Are you sure you want to delete this health reading? This action cannot be undone.</div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { onDelete(reading.id); setConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Log form ────────────────────────────────────────────── */
function LogForm({ onSave }: { onSave(r: HealthReading): void }) {
  const [type,     setType]     = useState<HealthMetricType>('blood_pressure');
  const [systolic, setSystolic] = useState('');
  const [diastolic,setDiastolic]= useState('');
  const [value,    setValue]    = useState('');
  const [note,     setNote]     = useState('');
  const [errors,   setErrors]   = useState<Record<string,string>>({});

  const changeType = (t: HealthMetricType) => {
    setType(t); setSystolic(''); setDiastolic(''); setValue(''); setErrors({});
  };

  const save = () => {
    const errs: Record<string,string> = {};
    if (type === 'blood_pressure') {
      const r = validateBloodPressure(+systolic || 0, +diastolic || 0);
      if (!r.ok) r.errors.forEach((e: string) => {
        if (e.includes('systolic')) errs.systolic = e;
        else if (e.includes('diastolic')) errs.diastolic = e;
      });
    } else if (type === 'blood_sugar') {
      const r = validateBloodSugar(+value || 0);
      if (!r.ok) r.errors.forEach((e: string) => { errs.value = e; });
    } else {
      const r = validateWeight(+value || 0);
      if (!r.ok) r.errors.forEach((e: string) => { errs.value = e; });
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    let reading: HealthReading;
    if (type === 'blood_pressure') {
      reading = { id: crypto.randomUUID(), type, systolic: +systolic, diastolic: +diastolic,
                  unit: 'mmHg', timestamp: new Date().toISOString(), note: note || undefined };
    } else {
      reading = { id: crypto.randomUUID(), type,
                  value: type === 'weight' ? parseFloat(value) : parseInt(value),
                  unit: type === 'blood_sugar' ? 'mg/dL' : 'kg',
                  timestamp: new Date().toISOString(), note: note || undefined } as HealthReading;
    }
    onSave(reading);
    setSystolic(''); setDiastolic(''); setValue(''); setNote('');
  };

  return (
    <div>
      <div className="seg-control">
        {(['blood_pressure','blood_sugar','weight'] as HealthMetricType[]).map(t => (
          <button key={t} type="button" className={`seg-btn ${type === t ? 'active' : ''}`}
            onClick={() => changeType(t)}>
            {t === 'blood_pressure' ? 'Blood Pressure' : t === 'blood_sugar' ? 'Blood Sugar' : 'Weight'}
          </button>
        ))}
      </div>

      {type === 'blood_pressure' && (
        <div className="field-2col">
          <div className="field">
            <label className="field-label">Systolic (mmHg)</label>
            <input type="number" className={`field-input ${errors.systolic ? 'err' : ''}`}
              value={systolic} onChange={e => setSystolic(e.target.value)} placeholder="e.g. 120" min={60} max={250} />
            {errors.systolic && <div className="field-error">{errors.systolic}</div>}
          </div>
          <div className="field">
            <label className="field-label">Diastolic (mmHg)</label>
            <input type="number" className={`field-input ${errors.diastolic ? 'err' : ''}`}
              value={diastolic} onChange={e => setDiastolic(e.target.value)} placeholder="e.g. 80" min={40} max={150} />
            {errors.diastolic && <div className="field-error">{errors.diastolic}</div>}
          </div>
        </div>
      )}

      {(type === 'blood_sugar' || type === 'weight') && (
        <div className="field">
          <label className="field-label">
            {type === 'blood_sugar' ? 'Blood Sugar (mg/dL)' : 'Weight (kg)'}
          </label>
          <input type="number" step={type === 'weight' ? '0.1' : undefined}
            className={`field-input ${errors.value ? 'err' : ''}`}
            value={value} onChange={e => setValue(e.target.value)}
            placeholder={type === 'weight' ? 'e.g. 70.5' : 'e.g. 90'} />
          {errors.value && <div className="field-error">{errors.value}</div>}
        </div>
      )}

      <div className="field">
        <label className="field-label">Notes (optional)</label>
        <textarea className="field-textarea" rows={2} value={note}
          onChange={e => setNote(e.target.value)} placeholder="e.g. fasting reading"
          maxLength={200} />
        <div className="field-hint">{note.length}/200</div>
      </div>

      <button className="btn btn-primary btn-full btn-lg" onClick={save}>Save Reading</button>
    </div>
  );
}

/* ── History panel ───────────────────────────────────────── */
function History({ readings, onDelete }: { readings: HealthReading[]; onDelete(id:string): void }) {
  if (!readings.length) {
    return (
      <div className="empty-state" style={{ padding:'48px 24px' }}>
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div className="empty-title">No readings recorded</div>
        <div className="empty-desc">Use the Log Reading tab to add your first measurement.</div>
      </div>
    );
  }

  const sections: { type: HealthMetricType; label: string; iconCls: string }[] = [
    { type: 'blood_pressure', label: 'Blood Pressure', iconCls: 'bp' },
    { type: 'blood_sugar',    label: 'Blood Sugar',    iconCls: 'bs' },
    { type: 'weight',         label: 'Weight',         iconCls: 'wt' },
  ];

  return (
    <div>
      {sections.map(({ type, label }) => {
        const items = [...readings.filter(r => r.type === type)]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (!items.length) return null;
        return (
          <div key={type} style={{ marginBottom: '24px' }}>
            <div className="divider-title mb-4">
              <div className="divider-title-bar" />
              <h3>{label}</h3>
              <span className="count-pill">{items.length}</span>
            </div>
            {items.map(r => <ReadingCard key={r.id} reading={r} onDelete={onDelete} />)}
          </div>
        );
      })}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export function HealthLogPage() {
  const { healthReadings, saveHealthReading, deleteHealthReading } = useAppData();
  const [tab, setTab] = useState<'log'|'history'>('log');

  const handleSave = (reading: HealthReading) => {
    saveHealthReading(reading);
    setTab('history');
  };

  return (
    <div>
      <div className="row-between mb-6">
        <div>
          <div className="page-title">Health Log</div>
          <div className="page-sub">Track your vital signs and health metrics</div>
        </div>
        <span className="badge badge-info">{healthReadings.length} reading{healthReadings.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card">
        <div className="tab-strip">
          <button className={`tab-btn ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>
            Log Reading
          </button>
          <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            History ({healthReadings.length})
          </button>
        </div>
        <div className="card-body fade-in">
          {tab === 'log'     && <LogForm onSave={handleSave} />}
          {tab === 'history' && <History readings={healthReadings} onDelete={deleteHealthReading} />}
        </div>
      </div>
    </div>
  );
}
