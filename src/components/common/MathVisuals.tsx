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
 * Styled with senior secondary academy uniform, coordinate grid, and floating balance scale.
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
        <pattern id="heroGridLight" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(37, 99, 235, 0.08)" strokeWidth="1" />
        </pattern>
        <linearGradient id="glowGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
          <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="accentGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
        <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6F4628" />
          <stop offset="100%" stopColor="#4B2C16" />
        </linearGradient>
        <linearGradient id="uniformDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="scaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Grid Canvas */}
      <rect x="10" y="10" width="380" height="320" rx="24" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="10" y="10" width="380" height="320" rx="24" fill="url(#heroGridLight)" />
      <circle cx="200" cy="160" r="130" fill="url(#glowGradLight)" filter="blur(16px)" />

      {/* Mathematical Graph Curves */}
      <path
        d="M 40 260 C 120 250, 180 180, 260 110 S 360 80, 360 80"
        stroke="url(#accentGradLight)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      <circle cx="260" cy="110" r="5" fill="#0EA5E9" />
      <text x="270" y="114" fill="#0369A1" fontSize="10" fontFamily="monospace" fontWeight="bold">
        (x, y) = (7, 14)
      </text>

      {/* Mini Floating Balance Scale Model */}
      <g transform="translate(45, 60)">
        <rect x="35" y="55" width="6" height="40" rx="3" fill="#94A3B8" />
        <path d="M 20 95 L 56 95 L 38 75 Z" fill="#64748B" />
        <line x1="0" y1="55" x2="76" y2="55" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        {/* Left Pan */}
        <line x1="5" y1="55" x2="0" y2="72" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="15" y1="55" x2="20" y2="72" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M -5 72 Q 10 78, 25 72 Z" fill="url(#scaleGrad)" />
        <rect x="2" y="62" width="16" height="10" rx="2" fill="#2563EB" />
        <text x="10" y="70" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
          3x
        </text>
        {/* Right Pan */}
        <line x1="61" y1="55" x2="56" y2="72" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="71" y1="55" x2="76" y2="72" stroke="#94A3B8" strokeWidth="1.5" />
        <path d="M 51 72 Q 66 78, 81 72 Z" fill="url(#scaleGrad)" />
        <rect x="58" y="62" width="16" height="10" rx="2" fill="#059669" />
        <text x="66" y="70" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">
          21
        </text>
        {/* Pivot Center Equal Sign */}
        <circle cx="38" cy="55" r="8" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
        <text x="38" y="58" fill="#2563EB" fontSize="10" fontWeight="bold" textAnchor="middle">
          =
        </text>
      </g>

      {/* Nigerian Secondary Student Figure (SS2 Learner) */}
      <g transform="translate(190, 85)">
        {/* Shadow */}
        <ellipse cx="80" cy="225" rx="55" ry="12" fill="rgba(37,99,235,0.10)" filter="blur(6px)" />

        {/* Torso & Senior Uniform (Academic Navy Blazer with subtle emerald tie) */}
        <path
          d="M 40 220 L 45 155 Q 80 148, 115 155 L 120 220 Z"
          fill="url(#uniformDark)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Uniform White Shirt Collar */}
        <polygon points="68,152 80,172 92,152 87,148 73,148" fill="#F8FAFC" />
        {/* School Tie */}
        <polygon points="77,165 83,165 85,200 80,208 75,200" fill="#059669" />

        {/* Neck */}
        <rect x="73" y="132" width="14" height="20" rx="4" fill="url(#skinTone)" />

        {/* Head */}
        <ellipse cx="80" cy="115" rx="24" ry="28" fill="url(#skinTone)" />

        {/* Hair - Neat Tapered Secondary School Fade */}
        <path
          d="M 56 112 Q 56 86, 80 86 Q 104 86, 104 112 Q 95 96, 80 96 Q 65 96, 56 112 Z"
          fill="#0F172A"
        />

        {/* Eyebrows & Glasses (Scholarly secondary student) */}
        <rect x="64" y="110" width="13" height="9" rx="2" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="83" y="110" width="13" height="9" rx="2" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
        <line x1="77" y1="113" x2="83" y2="113" stroke="#E2E8F0" strokeWidth="1.5" />

        {/* Confident Smile */}
        <path d="M 74 130 Q 80 135, 86 130" stroke="#FECDD3" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Hands holding digital slate */}
        <rect x="25" y="195" width="110" height="40" rx="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
        <rect x="30" y="200" width="100" height="30" rx="4" fill="#EFF6FF" />
        <text x="80" y="220" fill="#1D4ED8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          3x - 7 = 14 → x = 7
        </text>

        {/* Thumb fingers */}
        <ellipse cx="32" cy="210" rx="5" ry="8" fill="url(#skinTone)" />
        <ellipse cx="128" cy="210" rx="5" ry="8" fill="url(#skinTone)" />
      </g>

      {/* Floating Insight Pill Indicator */}
      <g transform="translate(20, 245)">
        <rect x="0" y="0" width="158" height="44" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <circle cx="22" cy="22" r="10" fill="#059669" />
        <text x="22" y="26" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
          ✓
        </text>
        <text x="40" y="19" fill="#0F172A" fontSize="10" fontWeight="bold">
          WAEC Syllabus Aligned
        </text>
        <text x="40" y="33" fill="#475569" fontSize="9">
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
    <div className={`flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#0F172A]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
        <span>The Equal Sign Is A Rigid Balance Scale:</span>
      </div>

      <svg width="340" height="150" viewBox="0 0 340 150" className="w-full max-w-[340px] overflow-visible">
        {/* Fulcrum base */}
        <polygon points="170,95 155,140 185,140" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="140" y="138" width="60" height="6" rx="3" fill="#475569" />

        {/* Pivot pin */}
        <circle cx="170" cy="95" r="7" fill="#2563EB" stroke="#EFF6FF" strokeWidth="2" />

        {/* Rotating Lever Arm */}
        <g transform={`rotate(${angle}, 170, 95)`} className="transition-transform duration-500 ease-out">
          <line x1="30" y1="95" x2="310" y2="95" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />

          {/* Left Pan Suspension */}
          <g transform="translate(30, 95)">
            <line x1="0" y1="0" x2="-15" y2="35" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="15" y2="35" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M -25 35 Q 0 45, 25 35 Z" fill="#2563EB" />
            <foreignObject x="-55" y="4" width="110" height="30">
              <div className="flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-mono font-bold text-[#1D4ED8] shadow-xs truncate">
                  {leftExpression}
                </span>
              </div>
            </foreignObject>
          </g>

          {/* Right Pan Suspension */}
          <g transform="translate(310, 95)">
            <line x1="0" y1="0" x2="-15" y2="35" stroke="#94A3B8" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="15" y2="35" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M -25 35 Q 0 45, 25 35 Z" fill="#059669" />
            <foreignObject x="-55" y="4" width="110" height="30">
              <div className="flex items-center justify-center">
                <span className="px-2.5 py-1 rounded-lg bg-[#D1FAE5] border border-[#A7F3D0] text-xs font-mono font-bold text-[#065F46] shadow-xs truncate">
                  {rightExpression}
                </span>
              </div>
            </foreignObject>
          </g>
        </g>
      </svg>

      <div className="mt-2 text-center text-xs">
        {isBalanced ? (
          <span className="text-[#065F46] font-semibold flex items-center justify-center gap-1.5">
            <span>⚖️ Both sides balanced: Equality preserved</span>
          </span>
        ) : (
          <span className="text-[#92400E] font-semibold flex items-center justify-center gap-1.5 bg-[#FEF3C7] px-3 py-1 rounded-lg border border-[#FDE68A]">
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
    <div className={`p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm ${className}`}>
      <div className="text-xs font-bold text-[#0F172A] mb-2 flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
        <span>Rainbow Multiplier Rule (Every term inside gets multiplied):</span>
      </div>

      <svg width="300" height="110" viewBox="0 0 300 110" className="w-full max-w-[300px] mx-auto overflow-visible">
        {/* Arch 1 to term 1 */}
        <path
          d="M 60 70 Q 95 10, 130 70"
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeDasharray="4 2"
          markerEnd="url(#arrowBlue)"
        />
        {/* Arch 2 to term 2 */}
        <path
          d="M 60 70 Q 130 -10, 205 70"
          fill="none"
          stroke="#D97706"
          strokeWidth="3"
          strokeDasharray="4 2"
          markerEnd="url(#arrowAmber)"
        />

        <defs>
          <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#2563EB" />
          </marker>
          <marker id="arrowAmber" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#D97706" />
          </marker>
        </defs>

        {/* Expression Text */}
        <text x="60" y="85" fill="#D97706" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {multiplier}
        </text>
        <text x="90" y="85" fill="#475569" fontSize="20" fontFamily="monospace" fontWeight="bold">
          (
        </text>
        <text x="130" y="85" fill="#1D4ED8" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {term1}
        </text>
        <text x="205" y="85" fill="#92400E" fontSize="18" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {term2}
        </text>
        <text x="245" y="85" fill="#475569" fontSize="20" fontFamily="monospace" fontWeight="bold">
          )
        </text>

        {/* Multiplied Results */}
        <text x="130" y="105" fill="#1D4ED8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          = 8x
        </text>
        <text x="205" y="105" fill="#92400E" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          = -6
        </text>
      </svg>

      <p className="text-[11px] text-[#475569] text-center mt-2">
        Common slip: Students calculate <span className="font-mono text-[#1D4ED8] font-bold">2 × 4x = 8x</span>, but forget to multiply{' '}
        <span className="font-mono text-[#92400E] font-bold">2 × (-3) = -6</span>!
      </p>
    </div>
  );
};
