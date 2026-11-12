import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
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
    <div className="max-w-md mx-auto my-auto min-h-[70vh] flex flex-col justify-center px-4 py-8 animate-fade-in space-y-5">
      <div className="text-center space-y-1.5">
        <span className="badge badge-primary inline-flex">
          <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Account recovery</span>
        </span>
        <h1 className="page-title">Reset your password</h1>
        <p className="body-text">
          Enter your registered student email or username to regain access.
        </p>
      </div>

      <div className="card-modern p-6 sm:p-7 space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[13px]"
          >
            {errorMessage}
          </div>
        )}

        {!demoPin && !isSuccess && (
          <form onSubmit={handleRequestPin} className="space-y-4">
            <div>
              <label htmlFor="recovery-identifier" className="label-modern">
                Student email or username
              </label>
              <div className="flex items-center gap-2.5 px-3 rounded-xl bg-white border border-[#E2E8F0] focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.14)] transition-shadow">
                <Mail className="w-4 h-4 text-[#94A3B8] shrink-0" aria-hidden="true" />
                <input
                  id="recovery-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. aminat_diallo"
                  autoComplete="username"
                  className="w-full min-h-[44px] bg-transparent text-[14px] text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              <span>{isLoading ? 'Generating PIN…' : 'Send recovery PIN'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        )}

        {demoPin && !isSuccess && (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] text-[13px] text-[#4338CA] leading-relaxed">
              Recovery PIN generated for on-device verification:{' '}
              <strong className="text-[#92400E] font-mono text-sm font-bold">{demoPin}</strong>
            </div>

            <div>
              <label htmlFor="recovery-pin" className="label-modern">
                Enter 6-digit PIN
              </label>
              <input
                id="recovery-pin"
                type="text"
                required
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="input-modern input-mono text-center tracking-[0.3em]"
              />
            </div>

            <div>
              <label htmlFor="recovery-new-password" className="label-modern">
                New password (at least 6 characters)
              </label>
              <input
                id="recovery-new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="input-modern"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              <KeyRound className="w-4 h-4" aria-hidden="true" />
              <span>{isLoading ? 'Updating password…' : 'Confirm password reset'}</span>
            </button>
          </form>
        )}

        {isSuccess && (
          <div className="p-5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#A7F3D0] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#059669]" aria-hidden="true" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Password updated</h2>
            <p className="text-[13px] text-[#065F46] leading-relaxed">
              Your password has been reset. You can now sign in with your new credentials.
            </p>
            <button onClick={onBackToLogin} className="btn-primary w-full">
              Back to sign in
            </button>
          </div>
        )}
      </div>

      <div className="text-center">
        <button onClick={onBackToLogin} className="btn-ghost">
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Return to login</span>
        </button>
      </div>
    </div>
  );
};
