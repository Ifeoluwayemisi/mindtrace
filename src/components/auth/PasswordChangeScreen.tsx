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
    <div className="max-w-md mx-auto my-auto min-h-[70vh] flex flex-col justify-center px-4 py-8 animate-fade-in space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EB] border border-[#FCECC2] text-[#B27B08] text-xs font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Security Notice · Password Update Required</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-[#252641]">
          Establish Your Private Password
        </h1>
        <p className="text-xs text-[#74788E] max-w-sm mx-auto leading-relaxed">
          Your account was provisioned with a temporary or school-assigned credential. For your academic and diagnostic privacy, you must establish a permanent password before accessing MindTrace.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#FFF1EE] border border-[#FDDDD7] text-[#D64D31] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">New Password</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <Lock className="w-4 h-4 text-[#74788E]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#74788E] hover:text-[#252641] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">Confirm New Password</label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <Lock className="w-4 h-4 text-[#74788E]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs text-white shadow-md shadow-[#6755E8]/30 transition flex items-center justify-center gap-2 cursor-pointer"
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
          className="inline-flex items-center gap-1.5 text-xs text-[#74788E] hover:text-[#252641] font-semibold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out and return later</span>
        </button>
      </div>
    </div>
  );
};
