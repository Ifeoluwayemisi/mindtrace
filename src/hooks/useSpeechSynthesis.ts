/**
 * MindTrace useSpeechSynthesis Hook
 * Connects React components with the offline-first Web Speech API service.
 */

import { useState, useEffect, useCallback } from 'react';
import { speechService, SpeechPlaybackState, VoiceStatus } from '../services/speechService';

export function useSpeechSynthesis() {
  const [playbackState, setPlaybackState] = useState<SpeechPlaybackState>(speechService.getState());
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(() => speechService.getVoiceStatus());

  useEffect(() => {
    const unsubscribe = speechService.subscribe((newState) => {
      setPlaybackState(newState);
    });

    // Refresh voice status on mount
    setVoiceStatus(speechService.getVoiceStatus());

    // Clean up active speech on unmount
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    speechService.speak(text, onEnd);
  }, []);

  const pause = useCallback(() => {
    speechService.pause();
  }, []);

  const resume = useCallback(() => {
    speechService.resume();
  }, []);

  const replay = useCallback(() => {
    speechService.replay();
  }, []);

  const stop = useCallback(() => {
    speechService.stop();
  }, []);

  return {
    state: playbackState,
    isPlaying: playbackState === 'playing',
    isPaused: playbackState === 'paused',
    isSupported: voiceStatus.isSupported,
    voiceStatus,
    speak,
    pause,
    resume,
    replay,
    stop,
  };
}
