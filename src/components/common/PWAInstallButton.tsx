import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'unsupported') {
        setShowModal(true);
      }
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm shadow-[#2563EB]/20 transition whitespace-nowrap cursor-pointer ${className}`}
        title="Install MindTrace for Offline Access"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-2xl text-[#0F172A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">Install MindTrace App</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 text-xs text-[#475569] space-y-3">
                <p className="font-semibold text-[#0F172A]">
                  Follow these steps in Safari on iOS:
                </p>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Tap the <strong className="text-[#2563EB]">Share button</strong> in Safari toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Scroll down and tap <strong className="text-[#2563EB]">Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Tap <strong className="text-[#2563EB]">Add</strong>. MindTrace will launch as a full offline app.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs text-[#475569] space-y-3">
                <p className="font-semibold text-[#0F172A]">
                  Install on your browser or device:
                </p>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Click the <strong className="text-[#2563EB]">Install icon</strong> in your browser address bar (top right).
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Or open browser menu (<strong className="text-[#2563EB]">⋮</strong>) and click <strong className="text-[#2563EB]">"Install MindTrace"</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#D1FAE5] text-[#065F46] text-[11px] font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Works with zero network latency using IndexedDB.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] py-2.5 text-xs font-bold text-white shadow-sm shadow-[#2563EB]/20 transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
