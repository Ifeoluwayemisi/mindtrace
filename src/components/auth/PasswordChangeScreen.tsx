import React, { useState } from 'react';
import { Lock, ShieldAlert, Eye, EyeOff, ArrowRight, LogOut, AlertCircle } from 'lucide-react';
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
    <div className="max-w-md mx-auto my-auto min-h-[70vh] flex flex-col justify-center px-4 py-8 animate-fade-in space-y-5">
      <div className="text-center space-y-2">
        <span className="badge badge-diagnostic inline-flex">
          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Security notice · password update required</span>
        </span>
        <h1 className="page-title">Set your private password</h1>
        <p className="body-text max-w-sm mx-auto">
          Your account was provisioned with a temporary or school-assigned credential. For your
          academic and diagnostic privacy, set a permanent password before continuing.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[13px] flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-modern p-6 sm:p-7 space-y-4">
        <div>
          <label htmlFor="new-password" className="label-modern">
            New password
          </label>
          <div className="flex items-center gap-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.14)] transition-shadow">
            <Lock className="w-4 h-4 text-[#94A3B8] shrink-0" aria-hidden="true" />
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="w-full min-h-[44px] bg-transparent text-[14px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="label-modern">
            Confirm new password
          </label>
          <div className="flex items-center gap-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.14)] transition-shadow">
            <Lock className="w-4 h-4 text-[#94A3B8] shrink-0" aria-hidden="true" />
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retype new password"
              autoComplete="new-password"
              className="w-full min-h-[44px] bg-transparent text-[14px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
            <p className="text-[12px] text-[#92400E] mt-1.5">Passwords do not match yet.</p>
          )}
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <span>Updating credentials…</span>
            ) : (
              <>
                <span>Save password & continue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-center">
        <button type="button" onClick={onLogout} className="btn-ghost">
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Log out and return later</span>
        </button>
      </div>
    </div>
  );
};
