// Dapur Senja — Warung Rush: game state and rules.
// world.js owns everything that changes while playing: the orders waiting
// on the board, the dish being assembled in the wok, the day timer, the
// score, the combo and the hearts. Rendering never mutates it; input calls
// these functions and the main loop ticks it.

import {
  DAY_SECONDS, ORDER_PATIENCE, PATIENCE_DAY_FACTOR, ORDER_EVERY, MAX_ORDERS,
  COOK_SECONDS, SERVE_WINDOW, HEARTS, SERVE_BASE, SERVE_PATIENCE_BONUS,
  COMBO_WINDOW, COMBO_STEP, DISHES, INGREDIENTS, ingredientById, dishById,
} from './config.js';

// A small deterministic random source so demo shots and replays look the
// same. Gameplay seeds it from the clock; shots.js seeds it fixed.
export function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function newGame(seed) {
  return {
    phase: 'title', // title | playing | dayEnd | gameOver
    day: 1,
    timeLeft: DAY_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    comboTimer: 0,
    hearts: HEARTS,
    served: 0,
    lost: 0,
    orders: [], // { id, dishId, patience, maxPatience, born }
    wok: [], // ingredient ids currently in the wok
    wokState: 'empty', // empty | assembling | cooking | ready | burnt
    cookTimer: 0,
    serveTimer: 0,
    orderTimer: ORDER_EVERY * 0.6, // first order arrives quickly
    nextOrderId: 1,
    rng: makeRng(seed ?? ((Date.now() % 2147483647) + 7)),
    flash: '', // transient message shown over the wok
    flashTimer: 0,
    muted: false,
    stats: { perfect: 0, burnt: 0, trashed: 0 },
  };
}

// Which dish, if any, does the wok currently hold? The set of ingredients
// must match a dish exactly; a partial set is "assembling", an extra or
// wrong ingredient is a ruined mix.
export function wokDish(game) {
  const have = [...game.wok].sort();
  for (const dish of DISHES) {
    const need = [...dish.needs].sort();
    if (have.length === need.length && have.every((id, i) => id === need[i])) return dish;
  }
  return null;
}

export function wokRuined(game) {
  if (game.wok.length === 0) return false;
  if (wokDish(game)) return false;
  // Ruined when no dish can still be completed from what is in the wok.
  return !DISHES.some((dish) =>
    game.wok.every((id) => dish.needs.includes(id)) &&
    dish.needs.length >= game.wok.length,
  );
}

export function addIngredient(game, id) {
  if (game.phase !== 'playing') return false;
  if (game.wokState === 'cooking' || game.wokState === 'ready' || game.wokState === 'burnt') return false;
  if (game.wok.includes(id)) return false; // one portion of each per dish
  game.wok.push(id);
  game.wokState = wokRuined(game) ? 'ruined' : 'assembling';
  return true;
}

export function startCooking(game) {
  if (game.phase !== 'playing') return false;
  if (game.wokState !== 'assembling' || !wokDish(game)) return false;
  game.wokState = 'cooking';
  game.cookTimer = COOK_SECONDS;
  return true;
}

export function trashWok(game) {
  if (game.phase !== 'playing') return false;
  if (game.wok.length === 0) return false;
  game.wok = [];
  game.wokState = 'empty';
  game.stats.trashed += 1;
  return true;
}

// The order this finished dish can be served to: the oldest ticket whose
// dish matches the wok. Serving to nobody is not possible by design.
export function matchingOrder(game) {
  const dish = wokDish(game);
  if (!dish || game.wokState !== 'ready') return null;
  return game.orders.find((order) => order.dishId === dish.id) ?? null;
}

export function serveDish(game) {
  const order = matchingOrder(game);
  if (!order) return null;
  const dish = dishById(order.dishId);
  const patienceLeft = order.patience / order.maxPatience;
  const comboBonus = game.comboTimer > 0 ? game.combo * COMBO_STEP : 0;
  const points = SERVE_BASE + Math.round(SERVE_PATIENCE_BONUS * patienceLeft) + comboBonus;
  game.score += points;
  game.coins += dish.price;
  game.served += 1;
  if (patienceLeft > 0.6) game.stats.perfect += 1;
  game.combo = game.comboTimer > 0 ? game.combo + 1 : 1;
  game.comboTimer = COMBO_WINDOW;
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.wok = [];
  game.wokState = 'empty';
  game.flash = `+${points} · ${dish.name} tersaji!`;
  game.flashTimer = 1.6;
  return { dish, points };
}

function spawnOrder(game) {
  const dish = DISHES[Math.floor(game.rng() * DISHES.length)];
  const patience = ORDER_PATIENCE * Math.pow(PATIENCE_DAY_FACTOR, game.day - 1);
  game.orders.push({
    id: game.nextOrderId++,
    dishId: dish.id,
    patience,
    maxPatience: patience,
  });
}

export function startDay(game) {
  game.phase = 'playing';
  game.timeLeft = DAY_SECONDS;
  game.orders = [];
  game.wok = [];
  game.wokState = 'empty';
  game.orderTimer = ORDER_EVERY * 0.6;
}

export function tick(game, dt) {
  if (game.phase !== 'playing') return;
  game.timeLeft -= dt;
  if (game.flashTimer > 0) game.flashTimer -= dt;
  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 0;
  }

  // New orders arrive on a steady rhythm while the board has room.
  game.orderTimer -= dt;
  if (game.orderTimer <= 0) {
    if (game.orders.length < MAX_ORDERS) spawnOrder(game);
    game.orderTimer = ORDER_EVERY;
  }

  // Patience drains; a customer who gives up costs a heart.
  for (const order of [...game.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      game.orders = game.orders.filter((o) => o.id !== order.id);
      game.lost += 1;
      game.hearts -= 1;
      game.flash = 'Pelanggan pergi...';
      game.flashTimer = 1.6;
      if (game.hearts <= 0) {
        game.phase = 'gameOver';
        return;
      }
    }
  }

  // Cooking progresses; a finished dish waits in its serving window,
  // then burns and must be thrown away.
  if (game.wokState === 'cooking') {
    game.cookTimer -= dt;
    if (game.cookTimer <= 0) {
      game.wokState = 'ready';
      game.serveTimer = SERVE_WINDOW;
    }
  } else if (game.wokState === 'ready') {
    game.serveTimer -= dt;
    if (game.serveTimer <= 0) {
      game.wokState = 'burnt';
      game.stats.burnt += 1;
      game.flash = 'Gosong! Buang dan masak lagi.';
      game.flashTimer = 1.6;
    }
  }

  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.phase = 'dayEnd';
  }
}

// Points the player could still earn from the dish in the wok, for the
// dossier's "how to play" text and the end-of-day summary.
export function describeWok(game) {
  if (game.wok.length === 0) return 'Wok kosong — pilih bahan di bawah.';
  const dish = wokDish(game);
  if (dish) return `${dish.name} siap dimasak.`;
  if (wokRuined(game)) return 'Campuran salah — buang (B) dan coba lagi.';
  return `${game.wok.length} bahan di wok...`;
}

export { INGREDIENTS, ingredientById };
