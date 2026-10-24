interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  medicineName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteDialog({ isOpen, medicineName, onConfirm, onClose }: ConfirmDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Medicine</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete <strong>{medicineName}</strong>? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
