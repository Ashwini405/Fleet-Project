import React, { useState } from 'react';
import { KeyRound, X, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';

// ─── Admin Reset Password Modal ───────────────────────────────────────────────

export default function ResetPasswordModal({ user, onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  if (!user) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    try {
      setSaving(true);
      const { data } = await api.post(`/users/${user.id}/reset-password`, { password });
      if (!data.success) { setError(data.message || 'Failed to reset password.'); return; }
      alert(`Password reset for @${user.username}. Share the new password with them.`);
      if (onDone) onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'input w-full pr-10';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" /> Reset Password
            </h3>
            <p className="text-[12px] font-medium text-gray-500 mt-0.5">
              {user.empName} · @{user.username}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="label">New Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Min. 8 characters"
                className={inputCls}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={show ? 'Hide' : 'Show'}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm Password <span className="text-red-500">*</span></label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              placeholder="Re-enter password"
              className="input w-full"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Share the new password with the user. They can change it later from My Account.
          </p>
          {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-70"
          >
            {saving ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
