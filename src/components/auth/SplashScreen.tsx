import React, { useEffect, useState } from 'react';
import { Sparkles, WifiOff } from 'lucide-react';

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
        <div className="w-20 h-20 rounded-2xl bg-[#2563EB] flex items-center justify-center shadow-xl shadow-[#2563EB]/25">
          <span className="font-display font-black text-white text-4xl">M</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#F8FAFC] shadow-sm flex items-center justify-center text-[#D97706]">
          <Sparkles className="w-4 h-4 fill-[#D97706]" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0F172A] tracking-tight">
        MindTrace
      </h1>

      <p className="text-sm text-[#475569] font-medium mt-2 max-w-sm">
        "Understand the mistake. Fix the misconception. Keep learning."
      </p>

      <div className="mt-8 flex items-center gap-2 text-xs text-[#1D4ED8] font-mono px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] font-semibold">
        <WifiOff className="w-3.5 h-3.5 text-[#2563EB]" />
        <span>100% Offline-First STEM Architecture</span>
      </div>

      {/* Progress Bar */}
      <div className="w-64 max-w-xs mt-6 space-y-2">
        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#2563EB] h-full rounded-full transition-all duration-300 shadow-xs"
            style={{ width: `${initProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#475569] font-mono font-medium">
          <span>{initStage}</span>
          <span className="font-bold text-[#2563EB]">{initProgress}%</span>
        </div>
      </div>
    </div>
  );
};
