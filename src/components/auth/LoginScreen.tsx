import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
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
    const demoId = role === 'student' ? 'aminat_diallo' : 'chinedu_okafor';
    const res = await authService.login(demoId, 'demo123');
    setIsLoading(false);
    if (res.success && res.user) {
      onLoginSuccess(res.user.role);
    }
  };

  return (
    <div className="max-w-md mx-auto my-auto min-h-[75vh] flex flex-col justify-center px-4 animate-fade-in space-y-6">
      {/* Disclaimer Banner for Hackathon Integrity */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Local Offline Authentication:</strong> Sessions and student profiles
          are stored safely on this device via IndexedDB. Cloud sync is deferred until network reconnection.
        </p>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-display font-extrabold text-white">
          Sign In to MindTrace
        </h1>
        <p className="text-xs text-slate-400">
          Access your personal diagnostic history and learning progress
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Username or School Email
          </label>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <User className="w-4 h-4 text-slate-500" />
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <button
              type="button"
              onClick={onGoToRecovery}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus-within:border-indigo-500">
            <Lock className="w-4 h-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Demo Switchers for Judges */}
        <div className="pt-3 border-t border-slate-800 text-center space-y-2">
          <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">
            One-Click Hackathon Evaluator Profiles:
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-[11px] font-semibold text-indigo-300 cursor-pointer transition"
            >
              Student Demo (Aminat)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('teacher')}
              className="px-3 py-1.5 rounded-lg bg-violet-950/80 hover:bg-violet-900 border border-violet-800 text-[11px] font-semibold text-violet-300 cursor-pointer transition"
            >
              Teacher Demo (Mr. Chinedu)
            </button>
          </div>
        </div>
      </form>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={onBack}
          className="hover:text-white transition cursor-pointer"
        >
          ← Back
        </button>
        <div className="space-x-1">
          <span>Don't have an account?</span>
          <button
            onClick={onGoToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
