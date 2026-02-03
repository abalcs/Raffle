import { useCallback, useRef } from 'react';

// Using Web Audio API for sound generation
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTick = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800 + Math.random() * 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  const playDrumRoll = useCallback(() => {
    const ctx = getAudioContext();
    const duration = 3;
    const ticksPerSecond = 20;

    for (let i = 0; i < duration * ticksPerSecond; i++) {
      const time = ctx.currentTime + (i / ticksPerSecond);
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Increase frequency towards the end for building tension
      const progress = i / (duration * ticksPerSecond);
      oscillator.frequency.value = 100 + progress * 200;
      oscillator.type = 'triangle';

      const volume = 0.05 + progress * 0.1;
      gainNode.gain.setValueAtTime(volume, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

      oscillator.start(time);
      oscillator.stop(time + 0.03);
    }
  }, [getAudioContext]);

  const playWinnerReveal = useCallback((isGrandPrize: boolean = false) => {
    const ctx = getAudioContext();

    // Fanfare notes
    const notes = isGrandPrize
      ? [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // C5 to G6
      : [523.25, 659.25, 783.99]; // C5 to G5

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + i * 0.1;
      const duration = isGrandPrize ? 0.3 : 0.2;

      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    // Add a shimmer effect for grand prize
    if (isGrandPrize) {
      for (let i = 0; i < 10; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 2000 + Math.random() * 2000;
        oscillator.type = 'sine';

        const startTime = ctx.currentTime + 0.5 + i * 0.05;
        gainNode.gain.setValueAtTime(0.05, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);
      }
    }
  }, [getAudioContext]);

  const playCelebration = useCallback(() => {
    const ctx = getAudioContext();

    // Ascending celebration pattern
    const pattern = [
      { freq: 523.25, time: 0 },
      { freq: 587.33, time: 0.1 },
      { freq: 659.25, time: 0.2 },
      { freq: 783.99, time: 0.3 },
      { freq: 880.00, time: 0.4 },
      { freq: 987.77, time: 0.5 },
      { freq: 1046.50, time: 0.6 },
      { freq: 1174.66, time: 0.7 },
      { freq: 1318.51, time: 0.8 },
    ];

    pattern.forEach(({ freq, time }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + time;
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }, [getAudioContext]);

  const playCountdown = useCallback((count: number) => {
    const ctx = getAudioContext();

    for (let i = 0; i < count; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Higher pitch for final count
      oscillator.frequency.value = i === count - 1 ? 880 : 440;
      oscillator.type = 'sine';

      const startTime = ctx.currentTime + i * 1;
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    }
  }, [getAudioContext]);

  return {
    playTick,
    playDrumRoll,
    playWinnerReveal,
    playCelebration,
    playCountdown,
  };
}
