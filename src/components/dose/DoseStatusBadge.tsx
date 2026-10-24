interface DoseStatusBadgeProps {
  classification: string;
}

export function DoseStatusBadge({ classification }: DoseStatusBadgeProps) {
  const colors = {
    upcoming: 'bg-blue-100 text-blue-800',
    due_now: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-gray-100 text-gray-600',
  };
  const labels = {
    upcoming: 'Upcoming',
    due_now: 'Due Now',
    overdue: 'Overdue',
    completed: 'Completed',
    pending: 'Pending',
  };
  const colorClass = (colors as Record<string, string>)[classification] || colors.pending;
  const label = (labels as Record<string, string>)[classification] || 'Pending';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}
