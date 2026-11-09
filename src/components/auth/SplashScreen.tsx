import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, WifiOff, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onInitialized: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onInitialized }) => {
  const [initProgress, setInitProgress] = useState(15);
  const [initStage, setInitStage] = useState('Initializing local IndexedDB store...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setInitProgress(45);
      setInitStage('Loading offline WAEC algebraic rules...');
    }, 400);

    const timer2 = setTimeout(() => {
      setInitProgress(85);
      setInitStage('Calibrating deterministic edge parser...');
    }, 850);

    const timer3 = setTimeout(() => {
      setInitProgress(100);
      setInitStage('Ready');
      setTimeout(onInitialized, 300);
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onInitialized]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
          <span className="font-display font-extrabold text-white text-4xl">M</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-amber-400">
          <Sparkles className="w-4 h-4 fill-amber-400" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
        MindTrace
      </h1>

      <p className="text-sm text-slate-300 font-medium mt-2 max-w-sm">
        "Understand the mistake. Fix the misconception. Keep learning."
      </p>

      <div className="mt-8 flex items-center gap-2 text-xs text-indigo-300 font-mono">
        <WifiOff className="w-3.5 h-3.5 text-indigo-400" />
        <span>100% Offline-First STEM Architecture</span>
      </div>

      {/* Progress Bar */}
      <div className="w-64 max-w-xs mt-6 space-y-2">
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${initProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{initStage}</span>
          <span>{initProgress}%</span>
        </div>
      </div>
    </div>
  );
};
