import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('bentexdemo');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'bentexdemo' && password === 'bentex123') {
      setError('');
      setPassword('');
      onSuccess();
    } else {
      setError('Invalid credentials. Please enter ID: bentexdemo & Password: bentex123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-11 h-11 rounded-full bg-stone-100 text-stone-900 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-5 h-5 text-amber-800" />
        </div>

        <h3 className="text-base font-serif font-bold text-center text-stone-900">
          Merchant Admin Access
        </h3>
        <p className="text-xs text-center text-stone-500 mt-1">
          Authorized owner access to inventory &amp; order management.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="font-medium text-stone-700 block mb-1">
              Admin Login ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="bentexdemo"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-stone-700 block mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 text-xs font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 text-[11px] text-stone-500">
            <span>Demo Credentials: ID: <strong>bentexdemo</strong> | Pass: <strong>bentex123</strong></span>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Unlock Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
