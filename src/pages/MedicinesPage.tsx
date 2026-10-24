import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { Medicine, MedicineForm, MedicineColor, Dose } from '../models';

/* ── Delete dialog ───────────────────────────────────────── */
function DeleteDialog({ name, onConfirm, onCancel }: { name: string; onConfirm(): void; onCancel(): void; }) {
  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div className="modal-title">Delete Medicine</div></div>
        <div className="modal-body">
          Are you sure you want to delete <strong style={{ color: 'var(--c-text-1)' }}>{name}</strong>?
          This will also remove all scheduled dose times.
        </div>
        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Medicine card ───────────────────────────────────────── */
function MedCard({ medicine, doses, onDelete }: { medicine: Medicine; doses: Dose[]; onDelete(m: Medicine): void; }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="med-card">
      <div className="med-card-inner">
        <div className="med-swatch-wrap">
          <div className="med-swatch" style={{ background: medicine.color + '1a' }}>
            <div className="med-swatch-dot" style={{ background: medicine.color }} />
          </div>
          {doses.length > 0 && <div className="med-count-badge">{doses.length}</div>}
        </div>

        <div className="med-details">
          <div className="med-name">{medicine.name}</div>
          <div className="med-tags">
            <span className="med-tag">{medicine.dosage}</span>
            <span className="med-tag">{medicine.form}</span>
          </div>
          {doses.length > 0 && (
            <div className="med-times">
              {doses.map(d => <span key={d.id} className="med-time-chip">{d.time}</span>)}
            </div>
          )}
          {medicine.notes && <div className="med-note">"{medicine.notes}"</div>}
        </div>

        <div className="med-actions">
          <button className="btn-icon-only" title="Delete" onClick={() => setConfirming(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      {confirming && (
        <DeleteDialog
          name={medicine.name}
          onConfirm={() => { onDelete(medicine); setConfirming(false); }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

/* ── Add form ────────────────────────────────────────────── */
function AddForm({ onSubmit }: { onSubmit(medicine: Medicine, doses: Dose[]): void }) {
  const [name,    setName]    = useState('');
  const [dosage,  setDosage]  = useState('');
  const [form,    setForm]    = useState<MedicineForm>('tablet');
  const [color,   setColor]   = useState<MedicineColor>('blue');
  const [notes,   setNotes]   = useState('');
  const [doses,   setDoses]   = useState<{id:string;time:string}[]>([]);
  const [newTime, setNewTime] = useState('');

  const addTime = () => {
    if (newTime && !doses.some(d => d.time === newTime)) {
      setDoses(prev => [...prev, { id: crypto.randomUUID(), time: newTime }]);
      setNewTime('');
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doses.length) { alert('Add at least one dose time.'); return; }
    const med: Medicine = {
      id: crypto.randomUUID(), name, dosage, form, color,
      notes: notes || undefined,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    onSubmit(med, doses.map(d => ({ id: crypto.randomUUID(), medicineId: med.id, time: d.time })));
    setName(''); setDosage(''); setForm('tablet'); setColor('blue'); setNotes(''); setDoses([]);
  };

  return (
    <form onSubmit={submit}>
      <div className="card mb-5">
        <div className="card-head">
          <div>
            <div className="card-head-title">Add New Medicine</div>
            <div className="card-head-sub">Fill in the details below — required fields marked *</div>
          </div>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label">Medicine Name <span className="req">*</span></label>
            <input className="field-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Amoxicillin" required />
          </div>

          <div className="field-2col">
            <div className="field">
              <label className="field-label">Dosage <span className="req">*</span></label>
              <input className="field-input" value={dosage} onChange={e => setDosage(e.target.value)}
                placeholder="e.g. 500mg" required />
            </div>
            <div className="field">
              <label className="field-label">Form <span className="req">*</span></label>
              <select className="field-select" value={form} onChange={e => setForm(e.target.value as MedicineForm)}>
                {['tablet','capsule','syrup','injection','cream','other'].map(v =>
                  <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Colour <span className="req">*</span></label>
            <select className="field-select" value={color} onChange={e => setColor(e.target.value as MedicineColor)}>
              {['red','orange','yellow','green','teal','blue','indigo','purple','pink','white','gray'].map(v =>
                <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Dose Times <span className="req">*</span></label>
            <div className="time-add-row">
              <input type="time" className="field-input" value={newTime}
                onChange={e => setNewTime(e.target.value)} />
              <button type="button" className="btn btn-secondary" onClick={addTime} disabled={!newTime}>
                Add Time
              </button>
            </div>
            {doses.length === 0
              ? <div className="field-hint">No dose times added yet</div>
              : <div className="time-chips">
                  {doses.map(d => (
                    <span key={d.id} className="time-chip">
                      {d.time}
                      <button type="button" className="time-chip-remove"
                        onClick={() => setDoses(prev => prev.filter(x => x.id !== d.id))}>×</button>
                    </span>
                  ))}
                </div>
            }
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Notes (optional)</label>
            <textarea className="field-textarea" rows={2} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional instructions, e.g. take with food" />
          </div>
        </div>
        <div className="card-foot">
          <button type="submit" className="btn btn-primary btn-lg">Save Medicine</button>
        </div>
      </div>
    </form>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export function MedicinesPage() {
  const { medicines, doses, saveMedicine, saveDose, deleteMedicine } = useAppData();

  const byMed = doses.reduce((acc, d) => {
    acc[d.medicineId] = acc[d.medicineId] || [];
    acc[d.medicineId].push(d);
    return acc;
  }, {} as Record<string,Dose[]>);

  const handleAdd = (med: Medicine, ds: Dose[]) => {
    saveMedicine(med);
    ds.forEach(saveDose);
  };

  return (
    <div>
      <div className="row-between mb-6">
        <div>
          <div className="page-title">My Medicines</div>
          <div className="page-sub">Manage your medications and dose schedules</div>
        </div>
        <span className="badge badge-info">{medicines.length} medicine{medicines.length !== 1 ? 's' : ''}</span>
      </div>

      <AddForm onSubmit={handleAdd} />

      <div className="divider-title mt-8 mb-4">
        <div className="divider-title-bar" />
        <h3>Saved Medicines</h3>
        <span className="count-pill">{medicines.length}</span>
      </div>

      {medicines.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <div className="empty-title">No medicines added yet</div>
            <div className="empty-desc">Use the form above to add your first medication.</div>
          </div>
        </div>
      ) : (
        medicines.map(med => (
          <MedCard key={med.id} medicine={med} doses={byMed[med.id] || []}
            onDelete={m => deleteMedicine(m.id)} />
        ))
      )}
    </div>
  );
}
