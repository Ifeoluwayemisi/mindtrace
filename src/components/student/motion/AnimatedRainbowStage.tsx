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
    <div className="w-full flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
      {/* Visual expression */}
      <div className="relative pt-10 pb-4 flex flex-wrap items-center justify-center gap-2 math-expression text-xl sm:text-2xl font-bold select-none">
        {/* Arc 1: outer factor to term A */}
        <div
          className={`absolute top-0 left-1/4 w-28 h-10 border-t-2 border-[#2563EB] rounded-t-full transition-opacity duration-500 pointer-events-none ${
            stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          aria-hidden="true"
        >
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-sans font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE] whitespace-nowrap">
            Arc 1: {multiplier} × {termA}
          </span>
        </div>

        {/* Arc 2: outer factor to term B */}
        <div
          className={`absolute top-1 left-1/3 w-44 h-14 border-t-2 border-[#0EA5E9] rounded-t-full transition-opacity duration-500 pointer-events-none ${
            stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          aria-hidden="true"
        >
          <span className="absolute -top-5 left-2/3 -translate-x-1/2 text-[10px] font-sans font-bold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded-full border border-[#7DD3FC] whitespace-nowrap">
            Arc 2: {multiplier} × ({termB})
          </span>
        </div>

        {/* Outside factor */}
        <span
          className={`px-3 py-1.5 rounded-xl transition-all duration-300 ${
            stage >= 1
              ? 'bg-[#2563EB] text-white ring-2 ring-[#BFDBFE] scale-110 shadow-md'
              : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
          }`}
        >
          {multiplier}
        </span>

        <span className="text-[#94A3B8]">(</span>

        {/* Term A */}
        <span
          className={`px-3 py-1.5 rounded-xl transition-all duration-300 ${
            stage === 1
              ? 'bg-[#2563EB] text-white ring-2 ring-[#BFDBFE] scale-110 shadow-md'
              : stage > 1
              ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
              : 'bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]'
          }`}
        >
          {termA}
        </span>

        {/* Term B */}
        <span
          className={`px-3 py-1.5 rounded-xl transition-all duration-300 ${
            stage === 2
              ? 'bg-[#0EA5E9] text-white ring-2 ring-[#BAE6FD] scale-110 shadow-md'
              : stage > 2
              ? 'bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC]'
              : 'bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]'
          }`}
        >
          {termB}
        </span>

        <span className="text-[#94A3B8]">)</span>
        <span className="text-[#94A3B8]">=</span>
        <span className="text-[#0F172A]">28</span>
      </div>

      {/* Computed terms */}
      <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div
          className={`p-3 rounded-xl border transition-all duration-500 ${
            stage >= 1
              ? 'bg-[#EFF6FF] border-[#BFDBFE] opacity-100 translate-y-0'
              : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 translate-y-2'
          }`}
        >
          <span className="text-[#1D4ED8] font-semibold block mb-0.5">Product 1</span>
          <span className="math-expression text-sm font-bold text-[#0F172A]">
            {multiplier} × {termA} = 8x
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border transition-all duration-500 ${
            stage >= 2
              ? 'bg-[#E0F2FE] border-[#7DD3FC] opacity-100 translate-y-0'
              : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 translate-y-2'
          }`}
        >
          <span className="text-[#0369A1] font-semibold block mb-0.5">Product 2</span>
          <span className="math-expression text-sm font-bold text-[#0F172A]">
            {multiplier} × ({termB}) = -12
          </span>
        </div>
      </div>

      {/* Result */}
      <div
        className={`px-4 py-2 rounded-xl text-[12px] math-expression text-center transition-all duration-500 border ${
          stage >= 3
            ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46] font-bold'
            : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
        }`}
      >
        {stage >= 3 ? (
          <span>Expanded line: 8x - 12 = 28 (both terms successfully multiplied)</span>
        ) : (
          <span>In progress: distributing the outer multiplier to all bracket members…</span>
        )}
      </div>
    </div>
  );
};
