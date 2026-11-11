import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

// Module-level cache so prompt is never lost across re-renders/navigation
let cachedPrompt: BeforeInstallPromptEvent | null =
  typeof window !== 'undefined' ? window.deferredPWAInstallPrompt || null : null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    cachedPrompt = e as BeforeInstallPromptEvent;
    window.deferredPWAInstallPrompt = cachedPrompt;
    window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
  });

  window.addEventListener('appinstalled', () => {
    cachedPrompt = null;
    window.deferredPWAInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined') {
      return cachedPrompt || window.deferredPWAInstallPrompt || null;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  const [isIOS, setIsIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check standalone mode
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };

    checkStandalone();

    // If window already holds the prompt, update state immediately
    if (window.deferredPWAInstallPrompt && !deferredPrompt) {
      setDeferredPrompt(window.deferredPWAInstallPrompt);
      cachedPrompt = window.deferredPWAInstallPrompt;
    }

    const handlePromptAvailable = () => {
      const prompt = cachedPrompt || window.deferredPWAInstallPrompt || null;
      setDeferredPrompt(prompt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      cachedPrompt = null;
      window.deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handlePromptAvailable);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePromptAvailable);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const install = async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    const promptToUse = deferredPrompt || cachedPrompt || window.deferredPWAInstallPrompt;
    if (!promptToUse) {
      return 'unsupported';
    }

    try {
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        cachedPrompt = null;
        window.deferredPWAInstallPrompt = null;
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      return 'unsupported';
    }
  };

  return {
    isInstallable: !!(deferredPrompt || cachedPrompt || window.deferredPWAInstallPrompt),
    isInstalled,
    isIOS,
    install,
  };
}
