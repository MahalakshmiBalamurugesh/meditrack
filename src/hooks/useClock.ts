import { useContext } from 'react';
import { ClockContext } from '../context/ClockContext';

export function useClock(): Date {
  const context = useContext(ClockContext);
  if (context === undefined) {
    throw new Error('useClock must be used within a ClockProvider');
  }
  return context.now;
}