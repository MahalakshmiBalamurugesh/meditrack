interface DoseSectionHeaderProps {
  title: string;
  count: number;
}

export function DoseSectionHeader({ title, count }: DoseSectionHeaderProps) {
  if (count === 0) return null;

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {title} <span className="text-sm font-normal text-gray-600">({count} dose{count !== 1 ? 's' : ''})</span>
      </h2>
    </div>
  );
}
