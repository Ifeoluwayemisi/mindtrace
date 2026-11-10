import React from 'react';

interface AnimatedBalanceScaleStageProps {
  leftExpression: string;
  rightExpression: string;
  isBalanced?: boolean;
  tiltAngle?: number;
  highlightLeft?: boolean;
  highlightRight?: boolean;
  activeOperation?: string;
  scaleLeftWeight?: number;
  scaleRightWeight?: number;
}

export const AnimatedBalanceScaleStage: React.FC<AnimatedBalanceScaleStageProps> = ({
  leftExpression,
  rightExpression,
  isBalanced = true,
  tiltAngle = 0,
  highlightLeft = false,
  highlightRight = false,
  activeOperation,
  scaleLeftWeight = 14,
  scaleRightWeight = 14,
}) => {
  const angle = isBalanced ? 0 : tiltAngle || -6;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80">
      {/* Operation announcement pill */}
      {activeOperation && (
        <div className="mb-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700/80 text-indigo-300 font-mono text-xs font-bold animate-fade-in flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Transformation: {activeOperation}</span>
        </div>
      )}

      <div className="w-full max-w-[380px] h-[190px] relative flex items-center justify-center select-none">
        <svg
          viewBox="0 0 380 190"
          className="w-full h-full overflow-visible transition-transform"
          aria-hidden="true"
        >
          {/* Fulcrum Base Platform */}
          <polygon
            points="190,120 170,175 210,175"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="2"
          />
          <rect x="150" y="173" width="80" height="8" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />

          {/* Central Pivot Hub */}
          <circle cx="190" cy="120" r="9" fill="#6366f1" stroke="#a5b4fc" strokeWidth="2.5" />
          <circle cx="190" cy="120" r="3" fill="#ffffff" />

          {/* Rotating Beam Assembly */}
          <g
            transform={`rotate(${angle}, 190, 120)`}
            className="transition-transform duration-700 ease-out"
          >
            {/* The Main Beam */}
            <line
              x1="35"
              y1="120"
              x2="345"
              y2="120"
              stroke="#e2e8f0"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Left Beam Extension Marker */}
            <circle cx="35" cy="120" r="5" fill="#818cf8" />
            {/* Right Beam Extension Marker */}
            <circle cx="345" cy="120" r="5" fill="#818cf8" />

            {/* Left Pan Chains & Plate */}
            <g transform="translate(35, 120)">
              <line x1="0" y1="0" x2="-22" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="22" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
              <path
                d="M -35 45 Q 0 58, 35 45 Z"
                fill={highlightLeft ? '#4338ca' : '#1e1b4b'}
                stroke={highlightLeft ? '#818cf8' : '#6366f1'}
                strokeWidth="2"
                className="transition-colors duration-300"
              />

              {/* Left Expression Label on Pan */}
              <foreignObject x="-65" y="8" width="130" height="36">
                <div className="flex items-center justify-center h-full">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md transition-all ${
                      highlightLeft
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105'
                        : 'bg-slate-900/90 text-indigo-200 border border-slate-700'
                    }`}
                  >
                    {leftExpression}
                  </span>
                </div>
              </foreignObject>
            </g>

            {/* Right Pan Chains & Plate */}
            <g transform="translate(345, 120)">
              <line x1="0" y1="0" x2="-22" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="22" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
              <path
                d="M -35 45 Q 0 58, 35 45 Z"
                fill={highlightRight ? '#065f46' : '#022c22'}
                stroke={highlightRight ? '#34d399' : '#10b981'}
                strokeWidth="2"
                className="transition-colors duration-300"
              />

              {/* Right Expression Label on Pan */}
              <foreignObject x="-65" y="8" width="130" height="36">
                <div className="flex items-center justify-center h-full">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold shadow-md transition-all ${
                      highlightRight
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 scale-105'
                        : 'bg-slate-900/90 text-emerald-200 border border-slate-700'
                    }`}
                  >
                    {rightExpression}
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>

          {/* Fulcrum Equals Symbol Pivot Indicator */}
          <text
            x="190"
            y="95"
            textAnchor="middle"
            fill={isBalanced ? '#34d399' : '#f43f5e'}
            fontSize="18"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {isBalanced ? '=' : '≠'}
          </text>
        </svg>
      </div>

      {/* Equality Status Banner */}
      <div
        className={`mt-1 text-xs px-3 py-1 rounded-xl font-medium transition-colors ${
          isBalanced
            ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/80'
            : 'text-rose-300 bg-rose-950/60 border border-rose-800/80'
        }`}
      >
        {isBalanced
          ? 'Equal Mathematical Weight Maintained on Both Sides (=)'
          : 'Scale Tilted: Operation performed on only one side breaks equality!'}
      </div>
    </div>
  );
};
