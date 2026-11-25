// Dapur Senja — Warung Rush: mouse and keyboard input.
// Every clickable region is computed from the same layout numbers the
// renderer uses, so a button never drifts away from where it is drawn.
// Input never touches the canvas directly: it calls world.js functions
// and plays a sound, and main.js owns the phase transitions.

import { VIEW, INGREDIENTS } from './config.js';
import { addIngredient, startCooking, serveDish, trashWok } from './world.js';
import { ensure, sfx, setMuted } from './audio.js';

// Ingredient bins on the counter, same geometry as render.js draws them.
function binRect(i) {
  const x = 90 + i * 140;
  return { x: x - 58, y: 514, w: 116, h: 92 };
}

function buttonRect(label) {
  // MASAK / SAJIKAN / BUANG sit under the stove (see render.js: the wok
  // station's cy is 300, so the buttons sit at 300 + 118).
  const y = 300 + 118;
  if (label === 'cook') return { x: 640 - 250, y, w: 140, h: 44 };
  if (label === 'serve') return { x: 640 - 70, y, w: 140, h: 44 };
  return { x: 640 + 110, y, w: 140, h: 44 };
}

function inside(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function canvasPos(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW.w,
    y: ((event.clientY - rect.top) / rect.height) * VIEW.h,
  };
}

export function attachInput(canvas, getGame, hooks) {
  // hooks: { onStart(), onRestart(), onTogglePause(), onPhaseChange() }
  // getGame() returns the live game object: main.js replaces it on restart,
  // so input must ask for it on every event instead of holding one copy.
  canvas.addEventListener('pointerdown', (event) => {
    ensure();
    const game = getGame();
    const { x, y } = canvasPos(canvas, event);
    if (game.phase === 'title') {
      if (inside(x, y, { x: 520, y: 430, w: 240, h: 56 })) hooks.onStart();
      return;
    }
    if (game.phase === 'dayEnd' || game.phase === 'gameOver') {
      if (inside(x, y, { x: 520, y: 470, w: 240, h: 56 })) hooks.onRestart();
      return;
    }
    if (game.phase !== 'playing') return;
    // Ingredient bins.
    for (let i = 0; i < INGREDIENTS.length; i++) {
      if (inside(x, y, binRect(i))) {
        if (addIngredient(game, INGREDIENTS[i].id)) sfx.add();
        else sfx.bad();
        return;
      }
    }
    // Action buttons.
    if (inside(x, y, buttonRect('cook'))) {
      if (startCooking(game)) sfx.sizzle();
      else sfx.bad();
      return;
    }
    if (inside(x, y, buttonRect('serve'))) {
      if (serveDish(game)) sfx.serve();
      else sfx.bad();
      return;
    }
    if (inside(x, y, buttonRect('trash'))) {
      if (trashWok(game)) sfx.trash();
      return;
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const game = getGame();
    const key = event.key.toLowerCase();
    if (key === 'm') {
      game.muted = !game.muted;
      setMuted(game.muted);
      return;
    }
    if (game.phase === 'title' && (key === 'enter' || key === ' ')) {
      ensure();
      hooks.onStart();
      return;
    }
    if ((game.phase === 'dayEnd' || game.phase === 'gameOver') && (key === 'r' || key === 'enter')) {
      hooks.onRestart();
      return;
    }
    if (key === 'p' && (game.phase === 'playing' || game.phase === 'paused')) {
      hooks.onTogglePause();
      return;
    }
    if (game.phase !== 'playing') return;
    ensure();
    const ing = INGREDIENTS.find((item) => item.key === key);
    if (ing) {
      if (addIngredient(game, ing.id)) sfx.add();
      else sfx.bad();
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      if (startCooking(game)) sfx.sizzle();
      else sfx.bad();
    } else if (key === 'enter') {
      if (serveDish(game)) sfx.serve();
      else sfx.bad();
    } else if (key === 'b') {
      if (trashWok(game)) sfx.trash();
    }
  });
}
