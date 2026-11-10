import React from 'react';

interface AnimatedRainbowStageProps {
  multiplier?: number;
  termA?: string;
  termB?: string;
  stage?: number; // 0: initial, 1: outer * termA, 2: outer * termB, 3: expanded
}

export const AnimatedRainbowStage: React.FC<AnimatedRainbowStageProps> = ({
  multiplier = 4,
  termA = '2x',
  termB = '- 3',
  stage = 0,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-4">
      {/* Visual Expression Display */}
      <div className="relative pt-8 pb-4 flex items-center justify-center gap-2 font-mono text-xl sm:text-2xl font-bold select-none">
        {/* Animated Arc 1 (Outer to Term A) */}
        <div
          className={`absolute top-0 left-1/4 w-28 h-10 border-t-2 border-indigo-400 rounded-t-full transition-opacity duration-500 pointer-events-none ${
            stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-sans font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800 shadow-sm whitespace-nowrap">
            Arc 1: 4 × 2x
          </span>
        </div>

        {/* Animated Arc 2 (Outer to Term B) */}
        <div
          className={`absolute top-1 left-1/3 w-44 h-14 border-t-2 border-pink-400 rounded-t-full transition-opacity duration-500 pointer-events-none ${
            stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <span className="absolute -top-5 left-2/3 -translate-x-1/2 text-[10px] font-sans font-bold text-pink-300 bg-pink-950 px-2 py-0.5 rounded-full border border-pink-800 shadow-sm whitespace-nowrap">
            Arc 2: 4 × (-3)
          </span>
        </div>

        {/* Outside Factor */}
        <span
          className={`px-3 py-1.5 rounded-xl transition-all duration-300 ${
            stage >= 1
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-110 shadow-lg'
              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
          }`}
        >
          {multiplier}
        </span>

        <span className="text-slate-500">(</span>

        {/* Term A */}
        <span
          className={`px-3 py-1.5 rounded-xl transition-all duration-300 ${
            stage === 1
              ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-110 shadow-lg'
              : stage > 1
              ? 'bg-slate-900 text-indigo-300 border border-indigo-800'
              : 'bg-slate-900 text-white border border-slate-800'
          }`}
        >
          {termA}
        </span>

        {/* Term B */}
        <span
          className={`px-3 py-1.5 rounded-xl transition-all duration-300 ${
            stage === 2
              ? 'bg-pink-600 text-white ring-2 ring-pink-400 scale-110 shadow-lg'
              : stage > 2
              ? 'bg-slate-900 text-pink-300 border border-pink-800'
              : 'bg-slate-900 text-white border border-slate-800'
          }`}
        >
          {termB}
        </span>

        <span className="text-slate-500">)</span>
        <span className="text-slate-500">=</span>
        <span className="text-slate-300 font-mono">28</span>
      </div>

      {/* Computed Terms Breakdown Cards */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3 text-xs">
        <div
          className={`p-3 rounded-xl border transition-all duration-500 ${
            stage >= 1
              ? 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-950/40 translate-y-0 opacity-100'
              : 'bg-slate-900/40 border-slate-800 opacity-40 translate-y-2'
          }`}
        >
          <span className="text-indigo-400 font-semibold block mb-0.5">Product 1:</span>
          <span className="font-mono text-sm font-bold text-white">4 × 2x = 8x</span>
        </div>

        <div
          className={`p-3 rounded-xl border transition-all duration-500 ${
            stage >= 2
              ? 'bg-pink-950/60 border-pink-500 shadow-md shadow-pink-950/40 translate-y-0 opacity-100'
              : 'bg-slate-900/40 border-slate-800 opacity-40 translate-y-2'
          }`}
        >
          <span className="text-pink-400 font-semibold block mb-0.5">Product 2:</span>
          <span className="font-mono text-sm font-bold text-white">4 × (-3) = -12</span>
        </div>
      </div>

      {/* Resulting equation line */}
      <div
        className={`px-4 py-2 rounded-xl text-xs font-mono text-center transition-all duration-500 ${
          stage >= 3
            ? 'bg-emerald-950/60 border border-emerald-600 text-emerald-200 font-bold shadow-sm'
            : 'bg-slate-900 text-slate-500 border border-slate-800'
        }`}
      >
        {stage >= 3 ? (
          <span>Expanded Line: 8x - 12 = 28 (Both terms successfully multiplied!)</span>
        ) : (
          <span>In progress: distributing outer multiplier to all bracket members...</span>
        )}
      </div>
    </div>
  );
};
