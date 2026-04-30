import confetti from 'canvas-confetti';

/**
 * Fire confetti — used for skill completion, phase done, high score, project done.
 */
export function fireConfetti(options = {}) {
  const defaults = {
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#60a5fa', '#a78bfa', '#f472b6', '#4ade80', '#facc15'],
    ...options,
  };
  confetti(defaults);
}

/**
 * Big burst for major achievements.
 */
export function fireBigConfetti() {
  const end = Date.now() + 600;
  const iv = setInterval(() => {
    if (Date.now() > end) return clearInterval(iv);
    confetti({
      particleCount: 30,
      angle: 60 + Math.random() * 60,
      spread: 55,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors: ['#60a5fa', '#a78bfa', '#f472b6', '#4ade80'],
    });
  }, 100);
}
