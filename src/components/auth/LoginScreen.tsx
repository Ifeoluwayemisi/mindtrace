import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { Role } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (role: Role) => void;
  onGoToRegister: () => void;
  onGoToRecovery: () => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoToRegister,
  onGoToRecovery,
  onBack,
}) => {
  const [identifier, setIdentifier] = useState('aminat_diallo');
  const [password, setPassword] = useState('pass1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await authService.login(identifier, password);
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user.role);
    } else {
      setErrorMessage(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setIsLoading(true);
    setErrorMessage(null);
    const demoId = role === 'student' ? 'aminat_diallo' : 'chinedu_okafor';
    const demoPass = role === 'student' ? 'pass1234' : 'teacher123';
    setIdentifier(demoId);
    setPassword(demoPass);

    const res = await authService.login(demoId, demoPass);
    setIsLoading(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user.role);
    } else {
      setErrorMessage(res.message || 'Failed to initialize demo session.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 py-6 animate-fade-in space-y-6">
      {/* Disclaimer Banner for Hackathon Integrity */}
      <div className="p-4 rounded-2xl bg-[#F3F1FF] border border-[#E4E0FD] text-xs text-[#5140CA] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#6755E8] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#252641]">Local Cryptographic Identity:</strong> Authentication verifies salted SHA-256 password hashes stored on-device. Zero cloud leakage or network dependency during offline practice.
        </p>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-display font-extrabold text-[#252641]">
          Sign In to MindTrace
        </h1>
        <p className="text-xs text-[#74788E]">
          Access your personalized diagnostic records, working history, and mastery roadmap
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#FFF1EE] border border-[#FDDDD7] text-[#D64D31] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-7 rounded-3xl bg-white border border-[#E9EAF3] shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#252641] mb-1.5">
            Username or School Email
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <User className="w-4 h-4 text-[#74788E]" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. aminat_diallo"
              className="w-full bg-transparent text-xs text-[#252641] placeholder:text-[#94A3B8] focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#252641]">
              Password
            </label>
            <button
              type="button"
              onClick={onGoToRecovery}
              className="text-[11px] text-[#6755E8] hover:text-[#5140CA] font-semibold cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#F8F9FF] border border-[#E9EAF3] focus-within:border-[#6755E8] focus-within:bg-white transition-all">
            <Lock className="w-4 h-4 text-[#74788E]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#6755E8] to-[#5140CA] hover:from-[#5B48DF] hover:to-[#4636BA] text-white font-bold text-xs shadow-md shadow-[#6755E8]/30 transition cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Verifying Cryptographic Hash...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Demo Switchers for Judges */}
        <div className="pt-3 border-t border-[#E9EAF3] text-center space-y-2">
          <span className="text-[11px] text-[#74788E] uppercase font-bold tracking-wider block">
            Quick Demo Profile Access:
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-3.5 py-2 rounded-xl bg-[#F3F1FF] hover:bg-[#EAE6FE] border border-[#E4E0FD] text-[11px] font-bold text-[#5140CA] cursor-pointer transition shadow-2xs"
            >
              Student Demo (Aminat)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher')}
              className="px-3.5 py-2 rounded-xl bg-[#EBF8FB] hover:bg-[#D8F2F8] border border-[#CEEEF6] text-[11px] font-bold text-[#167E96] cursor-pointer transition shadow-2xs"
            >
              Teacher Demo (Mr. Chinedu)
            </button>
          </div>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-[#74788E]">
        <button
          onClick={onBack}
          className="hover:text-[#252641] font-semibold transition cursor-pointer"
        >
          ← Back
        </button>
        <div className="space-x-1">
          <span>Don't have an account?</span>
          <button
            onClick={onGoToRegister}
            className="text-[#6755E8] hover:text-[#5140CA] font-bold cursor-pointer"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
