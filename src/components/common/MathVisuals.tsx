import React from 'react';

/**
 * MindTrace Educational Mathematical Visuals & Authentic Secondary Student Illustrations
 * 100% Offline SVG Bundled Assets (0 KB network request, crisp on retina, zero external breakage).
 * Designed for SS1-SS3 Nigerian secondary school learners.
 */

interface VisualProps {
  className?: string;
  size?: number;
}

/**
 * Hero Illustration: Focused Nigerian secondary school student exploring algebraic balance
 * Styled with senior secondary academy uniform, geometric grid, and floating balance scale.
 */
export const HeroStudentIllustration: React.FC<VisualProps> = ({ className = '', size = 320 }) => {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 400 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      role="img"
      aria-label="Illustration of a focused secondary student solving algebra with an interactive balance scale"
    >
      {/* Background Subtle Coordinate Grid Lines */}
      <defs>
        <pattern id="heroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1" />
        </pattern>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6F4628" />
          <stop offset="100%" stopColor="#4B2C16" />
        </linearGradient>
        <linearGradient id="uniformDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="scaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Grid Canvas */}
      <rect x="10" y="10" width="380" height="320" rx="24" fill="url(#heroGrid)" stroke="rgba(255,255,255,0.06)" />
      <circle cx="200" cy="160" r="130" fill="url(#glowGrad)" filter="blur(20px)" />

      {/* Mathematical Graph Curves */}
      <path
        d="M 40 260 C 120 250, 180 180, 260 110 S 360 80, 360 80"
        stroke="url(#accentGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      <circle cx="260" cy="110" r="5" fill="#06b6d4" />
      <text x="270" y="114" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">
        (x, y) = (7, 14)
      </text>

      {/* Mini Floating Balance Scale Model */}
      <g transform="translate(45, 60)">
        <rect x="35" y="55" width="6" height="40" rx="3" fill="#64748b" />
        <path d="M 20 95 L 56 95 L 38 75 Z" fill="#334155" />
        <line x1="0" y1="55" x2="76" y2="55" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        {/* Left Pan */}
        <line x1="5" y1="55" x2="0" y2="72" stroke="#64748b" strokeWidth="1.5" />
        <line x1="15" y1="55" x2="20" y2="72" stroke="#64748b" strokeWidth="1.5" />
        <path d="M -5 72 Q 10 78, 25 72 Z" fill="url(#scaleGrad)" />
        <rect x="2" y="62" width="16" height="10" rx="2" fill="#4f46e5" />
        <text x="10" y="70" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
          3x
        </text>
        {/* Right Pan */}
        <line x1="61" y1="55" x2="56" y2="72" stroke="#64748b" strokeWidth="1.5" />
        <line x1="71" y1="55" x2="76" y2="72" stroke="#64748b" strokeWidth="1.5" />
        <path d="M 51 72 Q 66 78, 81 72 Z" fill="url(#scaleGrad)" />
        <rect x="58" y="62" width="16" height="10" rx="2" fill="#059669" />
        <text x="66" y="70" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
          21
        </text>
        {/* Pivot Center Equal Sign */}
        <circle cx="38" cy="55" r="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
        <text x="38" y="58" fill="#a5b4fc" fontSize="10" fontWeight="bold" textAnchor="middle">
          =
        </text>
      </g>

      {/* Nigerian Secondary Student Figure (SS2 Learner) */}
      <g transform="translate(190, 85)">
        {/* Shadow */}
        <ellipse cx="80" cy="225" rx="55" ry="12" fill="rgba(0,0,0,0.4)" filter="blur(6px)" />

        {/* Torso & Senior Uniform (Academic Navy Blazer with subtle emerald tie) */}
        <path
          d="M 40 220 L 45 155 Q 80 148, 115 155 L 120 220 Z"
          fill="url(#uniformDark)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />
        {/* Uniform White Shirt Collar */}
        <polygon points="68,152 80,172 92,152 87,148 73,148" fill="#f8fafc" />
        {/* School Tie */}
        <polygon points="77,165 83,165 85,200 80,208 75,200" fill="#059669" />

        {/* Neck */}
        <rect x="73" y="132" width="14" height="20" rx="4" fill="url(#skinTone)" />

        {/* Head */}
        <ellipse cx="80" cy="115" rx="24" ry="28" fill="url(#skinTone)" />

        {/* Hair - Neat Tapered Secondary School Fade */}
        <path
          d="M 56 112 Q 56 86, 80 86 Q 104 86, 104 112 Q 95 96, 80 96 Q 65 96, 56 112 Z"
          fill="#17120e"
        />

        {/* Eyebrows & Glasses (Scholarly secondary student) */}
        <rect x="64" y="110" width="13" height="9" rx="2" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
        <rect x="83" y="110" width="13" height="9" rx="2" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="77" y1="113" x2="83" y2="113" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* Confident Smile */}
        <path d="M 74 130 Q 80 135, 86 130" stroke="#fecdd3" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Hands holding digital slate */}
        <rect x="25" y="195" width="110" height="40" rx="8" fill="#0f172a" stroke="#4f46e5" strokeWidth="2" />
        <rect x="30" y="200" width="100" height="30" rx="4" fill="#020617" />
        <text x="80" y="220" fill="#38bdf8" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          3x - 7 = 14 → x = 7
        </text>

        {/* Thumb fingers */}
        <ellipse cx="32" cy="210" rx="5" ry="8" fill="url(#skinTone)" />
        <ellipse cx="128" cy="210" rx="5" ry="8" fill="url(#skinTone)" />
      </g>

      {/* Floating Insight Pill Indicator */}
      <g transform="translate(20, 245)">
        <rect x="0" y="0" width="155" height="42" rx="14" fill="#0f172a" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
        <circle cx="20" cy="21" r="9" fill="#059669" />
        <text x="20" y="24" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
          ✓
        </text>
        <text x="36" y="18" fill="#e2e8f0" fontSize="10" fontWeight="bold">
          WAEC Syllabus Aligned
        </text>
        <text x="36" y="32" fill="#94a3b8" fontSize="9">
          100% Offline Cognitive Edge
        </text>
      </g>
    </svg>
  );
};

/**
 * Interactive / Renderable Visual Balance Scale
 * Illustrates algebraic preservation of equality across both sides of the '=' sign.
 */
interface BalanceScaleProps {
  leftExpression?: string;
  rightExpression?: string;
  isBalanced?: boolean;
  tiltAngle?: number; // degrees, e.g. -6 for left heavy, +6 for right heavy
  className?: string;
}

export const BalanceScaleVisual: React.FC<BalanceScaleProps> = ({
  leftExpression = '3x - 7 + 7',
  rightExpression = '14 + 7',
  isBalanced = true,
  tiltAngle = 0,
  className = '',
}) => {
  const angle = isBalanced ? 0 : tiltAngle || -6;

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800 ${className}`}>
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span>The Equal Sign Is A Rigid Balance Scale:</span>
      </div>

      <svg width="340" height="150" viewBox="0 0 340 150" className="w-full max-w-[340px] overflow-visible">
        {/* Fulcrum base */}
        <polygon points="170,95 155,140 185,140" fill="#334155" stroke="#475569" strokeWidth="2" />
        <rect x="140" y="138" width="60" height="6" rx="3" fill="#1e293b" />

        {/* Pivot pin */}
        <circle cx="170" cy="95" r="7" fill="#6366f1" stroke="#a5b4fc" strokeWidth="2" />

        {/* Rotating Lever Arm */}
        <g transform={`rotate(${angle}, 170, 95)`} className="transition-transform duration-500 ease-out">
          <line x1="30" y1="95" x2="310" y2="95" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />

          {/* Left Pan Suspension */}
          <g transform="translate(30, 95)">
            <line x1="0" y1="0" x2="-15" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="15" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M -25 35 Q 0 45, 25 35 Z" fill="#4f46e5" />
            <foreignObject x="-55" y="4" width="110" height="30">
              <div className="flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-700/80 text-xs font-mono font-bold text-indigo-200 shadow-sm truncate">
                  {leftExpression}
                </span>
              </div>
            </foreignObject>
          </g>

          {/* Right Pan Suspension */}
          <g transform="translate(310, 95)">
            <line x1="0" y1="0" x2="-15" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="15" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M -25 35 Q 0 45, 25 35 Z" fill="#059669" />
            <foreignObject x="-55" y="4" width="110" height="30">
              <div className="flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-700/80 text-xs font-mono font-bold text-emerald-200 shadow-sm truncate">
                  {rightExpression}
                </span>
              </div>
            </foreignObject>
          </g>
        </g>
      </svg>

      <div className="mt-1 text-center text-xs">
        {isBalanced ? (
          <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
            <span>⚖️ Both sides balanced: Equality preserved</span>
          </span>
        ) : (
          <span className="text-rose-400 font-semibold flex items-center justify-center gap-1">
            <span>⚠️ Scale tilted: You operated on one side without balancing the other!</span>
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Rainbow Bracket Expansion Visual
 * Demystifies 2(4x - 3) = 8x - 6 (showing multipliers reaching both terms)
 */
export const RainbowDistributionVisual: React.FC<{
  multiplier?: string;
  term1?: string;
  term2?: string;
  className?: string;
}> = ({ multiplier = '2', term1 = '4x', term2 = '- 3', className = '' }) => {
  return (
    <div className={`p-4 rounded-2xl bg-slate-950/80 border border-slate-800 ${className}`}>
      <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-violet-400" />
        <span>Rainbow Multiplier Rule (Every term inside gets multiplied):</span>
      </div>

      <svg width="300" height="110" viewBox="0 0 300 110" className="w-full max-w-[300px] mx-auto overflow-visible">
        {/* Arch 1 to term 1 */}
        <path
          d="M 60 70 Q 95 10, 130 70"
          fill="none"
          stroke="#818cf8"
          strokeWidth="3"
          strokeDasharray="4 2"
          markerEnd="url(#arrowIndigo)"
        />
        {/* Arch 2 to term 2 */}
        <path
          d="M 60 70 Q 130 -10, 205 70"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="3"
          strokeDasharray="4 2"
          markerEnd="url(#arrowRose)"
        />

        <defs>
          <marker id="arrowIndigo" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#818cf8" />
          </marker>
          <marker id="arrowRose" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#f43f5e" />
          </marker>
        </defs>

        {/* Expression Text */}
        <text x="60" y="85" fill="#f59e0b" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {multiplier}
        </text>
        <text x="90" y="85" fill="#94a3b8" fontSize="20" fontFamily="monospace" fontWeight="bold">
          (
        </text>
        <text x="130" y="85" fill="#818cf8" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {term1}
        </text>
        <text x="205" y="85" fill="#f43f5e" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {term2}
        </text>
        <text x="245" y="85" fill="#94a3b8" fontSize="20" fontFamily="monospace" fontWeight="bold">
          )
        </text>

        {/* Multiplied Results */}
        <text x="130" y="105" fill="#a5b4fc" fontSize="11" fontFamily="monospace" textAnchor="middle">
          = 8x
        </text>
        <text x="205" y="105" fill="#fda4af" fontSize="11" fontFamily="monospace" textAnchor="middle">
          = -6
        </text>
      </svg>

      <p className="text-[11px] text-slate-400 text-center mt-2">
        Common slip: Students calculate <span className="font-mono text-indigo-300">2 × 4x = 8x</span>, but forget to multiply{' '}
        <span className="font-mono text-rose-300">2 × (-3) = -6</span>!
      </p>
    </div>
  );
};
