import React from 'react';
import type { MedicineColor } from '../../models/Medicine';

interface MedicineColorBadgeProps {
  color: MedicineColor;
  size?: 'sm' | 'md';
}

const COLOR_MAP: Record<MedicineColor, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  teal: '#14b8a6',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#a855f7',
  pink: '#ec4899',
  white: '#f9fafb',
  gray: '#6b7280',
};

const SIZE_MAP: Record<NonNullable<MedicineColorBadgeProps['size']>, number> = {
  sm: 12,
  md: 16,
};

export function MedicineColorBadge({ color, size = 'md' }: MedicineColorBadgeProps) {
  const px = SIZE_MAP[size];

  const style: React.CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    borderRadius: '50%',
    backgroundColor: COLOR_MAP[color],
    display: 'inline-block',
    flexShrink: 0,
    border: color === 'white' ? '1px solid #e2e8f0' : 'none',
  };

  return (
    <span
      style={style}
      aria-label={`${color} color indicator`}
      role="img"
    />
  );
}