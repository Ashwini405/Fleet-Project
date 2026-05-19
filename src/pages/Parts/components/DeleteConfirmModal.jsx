import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, item, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5001/api/inventory/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete item.');
      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 mx-auto mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <h2 className="text-base font-bold text-slate-800 text-center">Delete Item?</h2>
        <p className="text-sm text-slate-500 text-center mt-1">
          <span className="font-semibold text-slate-700">{item.part_name}</span> will be permanently removed from inventory.
        </p>

        {error && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 text-center">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
