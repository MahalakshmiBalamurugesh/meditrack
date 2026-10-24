export type MedicineForm =
  | 'tablet'
  | 'capsule'
  | 'liquid'
  | 'injection'
  | 'patch'
  | 'inhaler'
  | 'drops'
  | 'other';

export const MEDICINE_FORMS: MedicineForm[] = [
  'tablet',
  'capsule',
  'liquid',
  'injection',
  'patch',
  'inhaler',
  'drops',
  'other',
];

export type MedicineColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink'
  | 'white'
  | 'gray';

export const MEDICINE_COLORS: MedicineColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'indigo',
  'purple',
  'pink',
  'white',
  'gray',
];

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  form: MedicineForm;
  color: MedicineColor;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
