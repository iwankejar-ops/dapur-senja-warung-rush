// Dapur Senja — Warung Rush: synthesized sound.
// No audio files ship with the game: every effect is a small Web Audio
// oscillator or filtered-noise burst, generated at runtime so the game
// stays offline and tiny. Call `ensure()` from a user gesture once; all
// other functions are safe to call before that (they no-op).

let ctx = null;
let muted = false;

export function ensure() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = value;
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0, slideTo = null) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur, vol = 0.08, freq = 1200, when = 0) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t0);
}

export const sfx = {
  // A soft pop when an ingredient drops into the wok.
  add() {
    tone(520, 0.09, 'triangle', 0.1, 0, 760);
    noise(0.05, 0.04, 2400);
  },
  // The wok hisses while the dish cooks.
  sizzle() {
    noise(0.5, 0.06, 3200);
    noise(0.4, 0.04, 5200, 0.12);
  },
  // Two-note ding when the dish is done.
  done() {
    tone(880, 0.16, 'sine', 0.12);
    tone(1318, 0.28, 'sine', 0.1, 0.12);
  },
  // Happy coin arpeggio when a dish is served.
  serve() {
    tone(659, 0.1, 'triangle', 0.11);
    tone(880, 0.1, 'triangle', 0.11, 0.08);
    tone(1174, 0.22, 'triangle', 0.11, 0.16);
  },
  // Low buzz for a wrong mix or a lost customer.
  bad() {
    tone(196, 0.22, 'sawtooth', 0.06, 0, 130);
  },
  // A short click for buttons and the trash bin.
  click() {
    tone(700, 0.05, 'square', 0.05);
  },
  // Gentle chime when a new order appears on the board.
  order() {
    tone(1046, 0.12, 'sine', 0.07);
    tone(784, 0.16, 'sine', 0.06, 0.09);
  },
  // End-of-day fanfare.
  fanfare() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.1, i * 0.11));
  },
};
