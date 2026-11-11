import React from 'react';
import { X, Copy, Check, BookOpen } from 'lucide-react';
import { MisconceptionCode } from '../../types';

interface ChalkboardScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMisconception?: MisconceptionCode;
}

export const ChalkboardScriptModal: React.FC<ChalkboardScriptModalProps> = ({
  isOpen,
  onClose,
  selectedMisconception = 'ALG_SIGN_FLIP',
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scriptContent = `MINDTRACE TEACHER INTERVENTION GUIDE: 5-MINUTE CHALKBORD SCRIPT
Class: SS2 Mathematics (Track: WAEC General Mathematics)
Target Misconception: Sign Reversal on Transposition (ALG_SIGN_FLIP)
Affected Students in Class A: 42% (18 students)

=======================================================
1. THE 60-SECOND HOOK (Draw on Chalkboard)
=======================================================
Write on board:
    3x - 7 = 14

Teacher Says:
"Class, yesterday over 40% of you correctly decided to move the 7, but wrote:
    3x = 14 - 7  (giving 7 instead of 21)
Why is that breaking mathematical law? Let's look at the balance."

=======================================================
2. THE VISUAL METAPHOR (The Balancing Scale)
=======================================================
Draw a simple balance beam with two pans:
    [ Left Pan: 3x - 7 ]  ====/\====  [ Right Pan: 14 ]

Teacher Action:
"If I have a bag with -7 debt on the left, how do I make it zero?
I must ADD 7 (+7).
To keep the scale level, what MUST I do to the right side?
I MUST ALSO ADD 7 (+7)!
    3x - 7 + 7 = 14 + 7
    3x = 21
Notice: The -7 didn't just walk across; we added +7 to BOTH sides!"

=======================================================
3. THE RAPID CHECK EQUATION (Whole Class Participation)
=======================================================
Write on board:
    4x - 9 = 15

Call on a student who struggled yesterday:
"What do we do to BOTH sides to clear the -9?"
Expected Student Response: "Add 9 to both sides!"
"4x = 15 + 9 = 24, so x = 6!"

Targeted remediation complete in 4 minutes. Proceed with curriculum.`;

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-surface max-w-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] p-5 sm:p-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-display font-bold text-[#0F172A]">
                5-Minute Chalkboard Intervention Script
              </h2>
              <p className="text-[12px] text-[#475569]">
                Pre-formatted pedagogical guide ready for tomorrow's morning lesson
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close chalkboard script" className="icon-btn shrink-0">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Script Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <pre className="select-all whitespace-pre-wrap rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5 font-mono text-[12px] leading-relaxed text-[#0F172A]">
            {scriptContent}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
          <span className="text-[12px] text-[#475569]">
            Targets the class misconception gap in under 5 minutes.
          </span>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="btn-primary">
              {copied ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Copy className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{copied ? 'Copied to clipboard' : 'Copy script'}</span>
            </button>
            <button onClick={onClose} className="btn-ghost">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
