import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { averageBloodPressure, averageBloodSugar, averageWeight, computeTrend } from '../modules';
import type { HealthMetricType, BloodPressureReading, BloodSugarReading, WeightReading, HealthReading } from '../models';

const METRICS: { type: HealthMetricType; label: string; unit: string }[] = [
  { type: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
  { type: 'blood_sugar',    label: 'Blood Sugar',    unit: 'mg/dL' },
  { type: 'weight',         label: 'Weight',         unit: 'kg' },
];

function fmtVal(r: HealthReading) {
  if (r.type === 'blood_pressure') return `${r.systolic}/${r.diastolic}`;
  return String(r.value);
}

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

export function TrendsPage() {
  const { healthReadings, deleteHealthReading } = useAppData();
  const [type, setType] = useState<HealthMetricType>('blood_pressure');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const meta = METRICS.find(m => m.type === type)!;

  const filtered = useMemo(() =>
    [...healthReadings.filter(r => r.type === type)]
      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [healthReadings, type]);

  const avgStr = useMemo(() => {
    if (type === 'blood_pressure') {
      const r = averageBloodPressure(filtered as BloodPressureReading[]);
      return r ? `${r.systolic}/${r.diastolic}` : null;
    }
    if (type === 'blood_sugar') {
      const v = averageBloodSugar(filtered as BloodSugarReading[]);
      return v != null ? String(v) : null;
    }
    const v = averageWeight(filtered as WeightReading[]);
    return v != null ? String(v) : null;
  }, [filtered, type]);

  const trend = useMemo(() => {
    if (filtered.length < 2) return null;
    const vals = filtered.map(r =>
      r.type === 'blood_pressure'
        ? ((r as BloodPressureReading).systolic + (r as BloodPressureReading).diastolic) / 2
        : (r as BloodSugarReading | WeightReading).value
    );
    return computeTrend(vals);
  }, [filtered]);

  const trendDir   = trend ?? 'stable';
  const trendLabel = trend === 'up' ? '↑ Rising' : trend === 'down' ? '↓ Falling' : trend === 'stable' ? '→ Stable' : '—';

  const iconCls = type === 'blood_pressure' ? 'bp' : type === 'blood_sugar' ? 'bs' : 'wt';
  const Icon    = type === 'blood_pressure' ? BpIcon : type === 'blood_sugar' ? BsIcon : WtIcon;

  return (
    <div>
      <div className="row-between mb-6">
        <div>
          <div className="page-title">Health Trends</div>
          <div className="page-sub">Track your health metrics over time</div>
        </div>
        <span className="badge badge-info">{filtered.length} readings</span>
      </div>

      {/* Metric selector */}
      <div className="seg-control mb-6">
        {METRICS.map(m => (
          <button key={m.type} type="button"
            className={`seg-btn ${type === m.type ? 'active' : ''}`}
            onClick={() => setType(m.type)}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid-2 mb-6">
        <div className="avg-card">
          <div className="avg-label">Average — {meta.label}</div>
          {avgStr
            ? <div><span className="avg-value">{avgStr}</span><span className="avg-unit">{meta.unit}</span></div>
            : <div style={{ color:'var(--c-text-3)', fontSize:'0.875rem', marginTop:'8px' }}>Not enough data yet</div>}
        </div>
        <div className="trend-card">
          <div className="trend-label">Trend Direction</div>
          {trend
            ? <>
                <div className={`trend-dir ${trendDir}`}>{trendLabel}</div>
                <div className="trend-hint">First half vs. second half of recorded readings</div>
              </>
            : <div style={{ color:'var(--c-text-3)', fontSize:'0.875rem', marginTop:'8px' }}>Add at least 2 readings to see a trend</div>}
        </div>
      </div>

      {/* Timeline */}
      <div className="divider-title mb-4">
        <div className="divider-title-bar" />
        <h3>Reading History</h3>
        <span className="count-pill">{filtered.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding:'48px 24px' }}>
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="empty-title">No readings yet</div>
            <div className="empty-desc">Add {meta.label.toLowerCase()} readings in the Health Log to see your trends here.</div>
          </div>
        </div>
      ) : (
        filtered.map(r => {
          const dt = new Date(r.timestamp).toLocaleString('en-US', {
            month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit'
          });
          return (
            <div key={r.id} className="reading-card">
              <div className={`reading-icon ${iconCls}`}><Icon /></div>
              <div className="reading-info">
                <div className="reading-type">{meta.label}</div>
                <div className="reading-value">
                  {fmtVal(r)} <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--c-text-3)' }}>{meta.unit}</span>
                </div>
                <div className="reading-time">{dt}</div>
                {r.note && <div className="reading-note">"{r.note}"</div>}
              </div>
              <button className="btn-icon-only" onClick={() => setConfirmId(r.id)} title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          );
        })
      )}

      {confirmId && (
        <div className="modal-bg" onClick={() => setConfirmId(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head"><div className="modal-title">Delete Reading</div></div>
            <div className="modal-body">Are you sure you want to delete this health reading?</div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteHealthReading(confirmId); setConfirmId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
