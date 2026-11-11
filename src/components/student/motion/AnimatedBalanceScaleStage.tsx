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
}) => {
  const angle = isBalanced ? 0 : tiltAngle || -6;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm">
      {/* Operation announcement pill */}
      {activeOperation && (
        <div className="mb-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono text-[11px] font-bold animate-fade-in flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" aria-hidden="true" />
          <span>Active transformation: {activeOperation}</span>
        </div>
      )}

      <div className="w-full max-w-[380px] h-[190px] relative flex items-center justify-center select-none">
        <svg
          viewBox="0 0 380 190"
          className="w-full h-full overflow-visible transition-transform"
          role="img"
          aria-label={`Balance scale: ${leftExpression} ${isBalanced ? 'equals' : 'is not equal to'} ${rightExpression}`}
        >
          {/* Fulcrum base platform */}
          <polygon points="190,120 170,175 210,175" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <rect x="150" y="173" width="80" height="8" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />

          {/* Central pivot hub */}
          <circle cx="190" cy="120" r="9" fill="#2563EB" stroke="#BFDBFE" strokeWidth="2.5" />
          <circle cx="190" cy="120" r="3" fill="#FFFFFF" />

          {/* Rotating beam */}
          <g transform={`rotate(${angle}, 190, 120)`} className="transition-transform duration-700 ease-out">
            <line x1="35" y1="120" x2="345" y2="120" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
            <circle cx="35" cy="120" r="5" fill="#60A5FA" />
            <circle cx="345" cy="120" r="5" fill="#60A5FA" />

            {/* Left pan */}
            <g transform="translate(35, 120)">
              <line x1="0" y1="0" x2="-22" y2="45" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="22" y2="45" stroke="#94A3B8" strokeWidth="1.5" />
              <path
                d="M -35 45 Q 0 58, 35 45 Z"
                fill={highlightLeft ? '#DBEAFE' : '#EFF6FF'}
                stroke={highlightLeft ? '#2563EB' : '#93C5FD'}
                strokeWidth="2"
                className="transition-colors duration-300"
              />

              <foreignObject x="-65" y="8" width="130" height="36">
                <div className="flex items-center justify-center h-full">
                  <span
                    className={`px-3 py-1 rounded-xl math-expression text-xs font-bold shadow-sm transition-all ${
                      highlightLeft
                        ? 'bg-[#2563EB] text-white ring-2 ring-[#BFDBFE] scale-105'
                        : 'bg-white text-[#1E40AF] border border-[#BFDBFE]'
                    }`}
                  >
                    {leftExpression}
                  </span>
                </div>
              </foreignObject>
            </g>

            {/* Right pan */}
            <g transform="translate(345, 120)">
              <line x1="0" y1="0" x2="-22" y2="45" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="22" y2="45" stroke="#94A3B8" strokeWidth="1.5" />
              <path
                d="M -35 45 Q 0 58, 35 45 Z"
                fill={highlightRight ? '#D1FAE5' : '#ECFDF5'}
                stroke={highlightRight ? '#059669' : '#6EE7B7'}
                strokeWidth="2"
                className="transition-colors duration-300"
              />

              <foreignObject x="-65" y="8" width="130" height="36">
                <div className="flex items-center justify-center h-full">
                  <span
                    className={`px-3 py-1 rounded-xl math-expression text-xs font-bold shadow-sm transition-all ${
                      highlightRight
                        ? 'bg-[#059669] text-white ring-2 ring-[#A7F3D0] scale-105'
                        : 'bg-white text-[#065F46] border border-[#A7F3D0]'
                    }`}
                  >
                    {rightExpression}
                  </span>
                </div>
              </foreignObject>
            </g>
          </g>

          {/* Equality indicator */}
          <text
            x="190"
            y="95"
            textAnchor="middle"
            fill={isBalanced ? '#059669' : '#D97706'}
            fontSize="18"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {isBalanced ? '=' : '≠'}
          </text>
        </svg>
      </div>

      {/* Equality status banner — icon + text, not colour alone */}
      <div
        className={`mt-1 text-[12px] px-3 py-1.5 rounded-xl font-medium border transition-colors ${
          isBalanced
            ? 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]'
            : 'text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]'
        }`}
      >
        {isBalanced
          ? 'Equal mathematical weight maintained on both sides (=)'
          : 'Scale tilted: an operation on only one side breaks equality'}
      </div>
    </div>
  );
};
