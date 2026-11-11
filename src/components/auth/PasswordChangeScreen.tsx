import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';

interface PasswordChangeScreenProps {
  onPasswordChanged: () => void;
  onLogout: () => void;
}

export const PasswordChangeScreen: React.FC<PasswordChangeScreenProps> = ({
  onPasswordChanged,
  onLogout,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please retype carefully.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.changePassword(newPassword);
      setIsLoading(false);

      if (res.success) {
        onPasswordChanged();
      } else {
        setErrorMessage(res.message || 'Failed to update password. Please try again.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('A network error occurred while updating your password.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-auto min-h-[70vh] flex flex-col justify-center px-4 py-8 animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security Notice · Password Update Required</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Establish Your Private Password
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Your account was provisioned with a temporary or school-assigned credential. For your academic and diagnostic privacy, you must establish a permanent password before accessing MindTrace.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Updating credentials...</span>
            ) : (
              <>
                <span>Save New Password & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out and return later</span>
        </button>
      </div>
    </div>
  );
};
