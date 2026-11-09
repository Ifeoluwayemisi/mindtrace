import React from 'react';
import { X, Copy, Check, Download, BookOpen, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">
                5-Minute Chalkboard Intervention Script
              </h2>
              <p className="text-xs text-slate-400">
                Pre-formatted pedagogical guide ready for tomorrow's morning lesson
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Script Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-200 leading-relaxed bg-slate-950/80 m-4 rounded-2xl border border-slate-800/80 whitespace-pre-wrap select-all">
          {scriptContent}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Targets 42% class misconception gap in under 5 minutes.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Script'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
