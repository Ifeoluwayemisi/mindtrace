import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, Check, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Don't show if already installed in standalone mode
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed recently (session-based)
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Show popup shortly after entering the app
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      return;
    }

    // If on iOS or browser without beforeinstallprompt event, open guided modal
    setShowGuideModal(true);
  };

  if (isInstalled || !isVisible) {
    return (
      <>
        {showGuideModal && (
          <PWAInstructionsModal
            isIOS={isIOS}
            onClose={() => setShowGuideModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Prominent floating install banner/popup */}
      <aside
        aria-label="Install MindTrace application"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-fade-in"
      >
        <div className="rounded-2xl bg-white border border-[#E2E8F0] p-4 sm:p-5 shadow-xl text-[#0F172A] relative">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss installation prompt"
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#2563EB] overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
              <img
                src="/icon-192.png"
                alt="MindTrace Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="font-display font-black text-white text-xl">M</span>
            </div>

            <div className="flex-1 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-display font-bold text-sm text-[#0F172A]">
                  Install MindTrace App
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold">
                  Offline-Ready
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Work 100% offline with zero data consumption on your phone, tablet, or PC.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition cursor-pointer"
            >
              Maybe Later
            </button>

            <button
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm shadow-[#2563EB]/25 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        </div>
      </aside>

      {showGuideModal && (
        <PWAInstructionsModal
          isIOS={isIOS}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </>
  );
};

interface PWAInstructionsModalProps {
  isIOS: boolean;
  onClose: () => void;
}

const PWAInstructionsModal: React.FC<PWAInstructionsModalProps> = ({ isIOS, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-2xl text-[#0F172A]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Install MindTrace</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="mt-4 text-xs text-[#475569] space-y-3">
            <p className="font-semibold text-[#0F172A]">
              Follow these simple steps in Safari to install:
            </p>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p>
                Tap the <strong className="text-[#2563EB]">Share button</strong> (square with up-arrow) at the bottom of Safari.
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p>
                Scroll down and select <strong className="text-[#2563EB]">Add to Home Screen</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <p>
                Tap <strong className="text-[#2563EB]">Add</strong> in the top-right corner. MindTrace will appear on your home screen.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-[#475569] space-y-3">
            <p className="font-semibold text-[#0F172A]">
              Install directly from your browser:
            </p>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p>
                Look for the <strong className="text-[#2563EB]">Install icon</strong> (computer with down arrow) in your browser address bar.
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p>
                Or open your browser menu (<strong className="text-[#2563EB]">⋮</strong>) and select <strong className="text-[#2563EB]">"Install MindTrace..."</strong>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#D1FAE5] text-[#065F46] text-[11px] font-medium flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Offline caching is active: MindTrace works without internet.</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] py-2.5 text-xs font-bold text-white shadow-sm shadow-[#2563EB]/20 transition cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
