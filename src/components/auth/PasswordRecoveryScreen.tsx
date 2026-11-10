import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { authService } from '../../services/authService';

interface PasswordRecoveryScreenProps {
  onBackToLogin: () => void;
}

export const PasswordRecoveryScreen: React.FC<PasswordRecoveryScreenProps> = ({
  onBackToLogin,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [demoPin, setDemoPin] = useState<string | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const res = await authService.recoverPassword(identifier);
    setIsLoading(false);
    if (res.success && res.demoCode) {
      setDemoPin(res.demoCode);
      setEnteredPin(res.demoCode);
    } else {
      setErrorMessage(res.message || 'Account not found. Please verify username or email.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await authService.resetPassword(identifier, enteredPin, newPassword);
    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res.message || 'Failed to update password.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-auto min-h-[70vh] flex flex-col justify-center px-4 animate-fade-in space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-display font-extrabold text-white">
          Reset Your Password
        </h1>
        <p className="text-xs text-slate-400">
          Enter your registered student email or username to reset your access
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs">
            {errorMessage}
          </div>
        )}

        {!demoPin && !isSuccess && (
          <form onSubmit={handleRequestPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Email or Username
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
                <Mail className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. aminat_diallo"
                  className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Generating PIN...' : 'Send Recovery PIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {demoPin && !isSuccess && (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-800 text-xs text-indigo-300">
              Recovery PIN generated for on-device verification:{' '}
              <strong className="text-amber-300 font-mono text-sm">{demoPin}</strong>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter 6-Digit PIN
              </label>
              <input
                type="text"
                required
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-center text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password (at least 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Updating Password...' : 'Confirm Password Reset'}</span>
            </button>
          </form>
        )}

        {isSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Password Updated!</h3>
            <p className="text-xs text-emerald-300/90">
              Your password has been reset successfully. You can now log in with your updated credentials.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={onBackToLogin}
          className="text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
        >
          ← Return to Login
        </button>
      </div>
    </div>
  );
};
