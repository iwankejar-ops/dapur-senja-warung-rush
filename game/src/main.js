// Dapur Senja — Warung Rush: entry point and main loop.
// Boots the canvas, wires input, and runs the frame loop. The game state
// lives in world.js; this file only owns the animation clock, the phase
// transitions the buttons ask for, and the end-of-phase sounds.

import { VIEW } from './config.js';
import { newGame, startDay, tick } from './world.js';
import { drawGame } from './render.js';
import { attachInput } from './input.js';
import { stagedGame } from './shots.js';
import { ensure, sfx, setMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.w;
canvas.height = VIEW.h;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
let game = shot ? stagedGame(shot) ?? newGame() : newGame();
let pausedFrom = null;
let lastPhase = game.phase;

function beginDay() {
  game = newGame();
  startDay(game);
  ensure();
  sfx.order();
}

attachInput(canvas, () => game, {
  onStart() {
    startDay(game);
    ensure();
    sfx.order();
  },
  onRestart() {
    beginDay();
  },
  onTogglePause() {
    if (game.phase === 'playing') {
      pausedFrom = 'playing';
      game.phase = 'paused';
    } else if (game.phase === 'paused') {
      game.phase = pausedFrom ?? 'playing';
    }
  },
});

setMuted(game.muted);

// A debug handle for local playtesting (used by scratch/playtest.cjs):
// read the live game state from the console or a script.
window.__dapur = { get game() { return game; } };

// The loop: fixed-dt ticks so cooking and patience run at the same speed
// on any display, with rendering decoupled from the tick rate.
let last = performance.now();
let acc = 0;
const STEP = 1 / 60;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (game.phase === 'playing') {
    acc += dt;
    while (acc >= STEP) {
      tick(game, STEP);
      acc -= STEP;
      if (game.phase !== 'playing') break;
    }
  }
  // Phase-change sounds, once per transition.
  if (game.phase !== lastPhase) {
    if (game.phase === 'dayEnd') sfx.fanfare();
    if (game.phase === 'gameOver') sfx.bad();
    lastPhase = game.phase;
  }
  drawGame(ctx, game, now / 1000);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
