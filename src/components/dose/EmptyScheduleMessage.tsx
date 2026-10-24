export function EmptyScheduleMessage() {
  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No doses scheduled for today</h3>
      <p className="text-gray-600">
        Add medicines with dose schedules to start tracking your medication routine.
      </p>
    </div>
  );
}
