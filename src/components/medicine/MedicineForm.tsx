import { useState } from 'react';
import type { MedicineForm, MedicineColor } from '../../models';
import type { Medicine } from '../../models';

interface MedicineFormProps {
  onSubmit: (medicine: Medicine) => void;
}

export function MedicineForm({ onSubmit }: MedicineFormProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [color, setColor] = useState<MedicineColor>('blue');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMedicine: Medicine = {
      id: crypto.randomUUID(),
      name,
      dosage,
      form,
      color,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSubmit(newMedicine);
    setName('');
    setDosage('');
    setForm('tablet');
    setColor('blue');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Medicine</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medicine Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          placeholder="e.g., Amoxicillin"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dosage *
        </label>
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., 500mg"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Form *
        </label>
        <select
          value={form}
          onChange={(e) => setForm(e.target.value as MedicineForm)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="tablet">Tablet</option>
          <option value="capsule">Capsule</option>
          <option value="syrup">Syrup</option>
          <option value="injection">Injection</option>
          <option value="cream">Cream</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color *
        </label>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value as MedicineColor)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="red">Red</option>
          <option value="orange">Orange</option>
          <option value="yellow">Yellow</option>
          <option value="green">Green</option>
          <option value="teal">Teal</option>
          <option value="blue">Blue</option>
          <option value="indigo">Indigo</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="white">White</option>
          <option value="gray">Gray</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Any additional notes..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Add Medicine
      </button>
    </form>
  );
}
