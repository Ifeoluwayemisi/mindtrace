/**
 * MindTrace Offline-First Speech Service (Web Speech API)
 * Zero-bandwidth audio read-aloud for mathematical instructions, cognitive diagnoses, and interventions.
 */

export type SpeechPlaybackState = 'idle' | 'playing' | 'paused' | 'unavailable';

export interface VoiceStatus {
  isSupported: boolean;
  hasVoices: boolean;
  voiceCount: number;
  selectedVoiceName?: string;
  isOfflineVoice: boolean;
  errorMessage?: string;
}

class SpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentText: string = '';
  private state: SpeechPlaybackState = 'idle';
  private keepAliveTimer: number | null = null;
  private listeners: Set<(state: SpeechPlaybackState) => void> = new Set();
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    } else {
      this.state = 'unavailable';
    }
  }

  private initVoices() {
    try {
      this.voices = window.speechSynthesis.getVoices();
    } catch {
      this.voices = [];
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public getVoiceStatus(): VoiceStatus {
    if (!this.isSupported()) {
      return {
        isSupported: false,
        hasVoices: false,
        voiceCount: 0,
        isOfflineVoice: false,
        errorMessage: 'Web Speech API is not supported in this browser.',
      };
    }

    const availableVoices = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
    const englishVoice = availableVoices.find(
      (v) => v.lang.startsWith('en') && (v.localService || v.default)
    ) || availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];

    const isOffline = Boolean(englishVoice && (englishVoice.localService || !englishVoice.voiceURI.includes('network')));

    return {
      isSupported: true,
      hasVoices: availableVoices.length > 0,
      voiceCount: availableVoices.length,
      selectedVoiceName: englishVoice ? englishVoice.name : undefined,
      isOfflineVoice: isOffline,
    };
  }

  /**
   * Translates mathematical symbols and formatting into natural educational English speech.
   */
  public formatMathForSpeech(text: string): string {
    return text
      // Remove Markdown bold/code markers
      .replace(/[*_`#]/g, '')
      // Handle division fractions like (2x - 4)/3
      .replace(/\(([a-zA-Z0-9\s+-]+)\)\s*\/\s*([0-9a-zA-Z]+)/g, ' the fraction $1 over $2 ')
      .replace(/([a-zA-Z0-9]+)\s*\/\s*([0-9a-zA-Z]+)/g, '$1 over $2')
      // Handle powers
      .replace(/\^2/g, ' squared ')
      .replace(/\^3/g, ' cubed ')
      .replace(/\^([0-9]+)/g, ' to the power of $1 ')
      // Math operators with clear pauses
      .replace(/\s*=\s*/g, ' equals ')
      .replace(/\s*\+\s*/g, ' plus ')
      .replace(/\s*-\s*/g, ' minus ')
      .replace(/\s*\*\s*/g, ' times ')
      // Variable spacing (e.g. 3x -> 3 x, -7x -> -7 x)
      .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
      // Replace multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  public subscribe(listener: (state: SpeechPlaybackState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    // Chrome bug workaround: speech synthesis can pause unexpectedly after ~15s
    this.keepAliveTimer = window.setInterval(() => {
      if (this.state === 'playing' && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer !== null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  /**
   * Starts reading text aloud. Will not execute if speech is unsupported.
   */
  public speak(rawText: string, onEndCallback?: () => void) {
    if (!this.isSupported()) {
      this.state = 'unavailable';
      this.notify();
      return;
    }

    // Cancel any active speech first
    this.stop();

    const formatted = this.formatMathForSpeech(rawText);
    this.currentText = rawText;

    try {
      const utterance = new SpeechSynthesisUtterance(formatted);
      this.utterance = utterance;

      // Select preferred English voice
      const voices = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && (v.localService || v.default)
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.rate = 0.95; // Slightly slower for clarity in mathematical steps
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.state = 'playing';
        this.notify();
        this.startKeepAlive();
      };

      utterance.onpause = () => {
        this.state = 'paused';
        this.notify();
      };

      utterance.onresume = () => {
        this.state = 'playing';
        this.notify();
      };

      utterance.onend = () => {
        this.state = 'idle';
        this.stopKeepAlive();
        this.notify();
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (event) => {
        // "interrupted" or "canceled" are standard when stopping/switching
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('Speech synthesis error:', event.error);
        }
        this.state = 'idle';
        this.stopKeepAlive();
        this.notify();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis speak failed:', err);
      this.state = 'idle';
      this.notify();
    }
  }

  public pause() {
    if (!this.isSupported()) return;
    if (this.state === 'playing') {
      try {
        window.speechSynthesis.pause();
        this.state = 'paused';
        this.notify();
      } catch (err) {
        console.warn('SpeechSynthesis pause failed:', err);
      }
    }
  }

  public resume() {
    if (!this.isSupported()) return;
    if (this.state === 'paused') {
      try {
        window.speechSynthesis.resume();
        this.state = 'playing';
        this.notify();
      } catch (err) {
        console.warn('SpeechSynthesis resume failed:', err);
      }
    }
  }

  public replay() {
    if (!this.isSupported() || !this.currentText) return;
    this.speak(this.currentText);
  }

  public stop() {
    this.stopKeepAlive();
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // safe
    }
    this.state = 'idle';
    this.notify();
  }

  public getState(): SpeechPlaybackState {
    return this.state;
  }
}

export const speechService = new SpeechService();
