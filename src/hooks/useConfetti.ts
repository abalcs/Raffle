import confetti from 'canvas-confetti';

export function useConfetti() {
  const fireConfetti = (intensity: 'small' | 'medium' | 'large' = 'medium') => {
    const settings = {
      small: { particleCount: 50, spread: 60 },
      medium: { particleCount: 100, spread: 70 },
      large: { particleCount: 200, spread: 100 },
    };

    const { particleCount, spread } = settings[intensity];

    // Fire from left
    confetti({
      particleCount,
      spread,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#007bc7', '#38bdf8', '#ffffff', '#fbbf24'],
    });

    // Fire from right
    confetti({
      particleCount,
      spread,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#007bc7', '#38bdf8', '#ffffff', '#fbbf24'],
    });
  };

  const fireGrandFinale = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#007bc7', '#38bdf8', '#0ea5e9', '#ffffff', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const fireStars = () => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#007bc7', '#38bdf8', '#ffffff'],
    };

    confetti({
      ...defaults,
      particleCount: 50,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti({
      ...defaults,
      particleCount: 25,
      scalar: 0.75,
      shapes: ['circle'],
    });
  };

  return { fireConfetti, fireGrandFinale, fireStars };
}
