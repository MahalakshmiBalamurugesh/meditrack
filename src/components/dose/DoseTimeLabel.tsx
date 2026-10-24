interface DoseTimeLabelProps {
  time: string;
}

export function DoseTimeLabel({ time }: DoseTimeLabelProps) {
  // Convert HH:MM to h:MM AM/PM format
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return (
    <span className="text-lg font-semibold text-gray-900">
      {displayHours}:{displayMinutes} {ampm}
    </span>
  );
}
