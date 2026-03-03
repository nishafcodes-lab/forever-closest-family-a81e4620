import { useCallback, useRef } from "react";

// Generate a short notification tone using Web Audio API
const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);

    // Clean up
    oscillator.onended = () => ctx.close();
  } catch {
    // Silently fail if audio isn't available
  }
};

export const useNotificationSound = () => {
  const lastPlayed = useRef(0);

  const playMessageSound = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayed.current < 500) return; // Debounce
    lastPlayed.current = now;
    // Two-tone chime: pleasant notification
    playTone(880, 0.15, 0.2);
    setTimeout(() => playTone(1100, 0.2, 0.15), 100);
  }, []);

  const playAISound = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayed.current < 500) return;
    lastPlayed.current = now;
    // Softer, lower tone for AI responses
    playTone(660, 0.12, 0.15);
    setTimeout(() => playTone(880, 0.18, 0.12), 80);
  }, []);

  return { playMessageSound, playAISound };
};
