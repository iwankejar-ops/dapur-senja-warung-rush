// Dapur Senja — Warung Rush: staged states for the entry screenshots.
// `?shot=<name>` opens the game in a fixed, deterministic state so the
// screenshots are real renders of the game's own code, not mock-ups:
//   start — the title screen over a dressed kitchen
//   play  — a dish mid-assembly: two ingredients in the wok, timer running
//   serve — a finished Nasi Goreng on the plate, ready to serve
//   end   — the end-of-day summary
// Gameplay is untouched: these states only ever come from the query string.

import { newGame, startDay } from './world.js';
import { dishById } from './config.js';

function basePlaying(seed) {
  const game = newGame(seed);
  startDay(game);
  game.timeLeft = 118;
  return game;
}

function addOrder(game, dishId, patienceFrac) {
  const dish = dishById(dishId);
  const patience = 45 * patienceFrac;
  game.orders.push({ id: game.nextOrderId++, dishId: dish.id, patience, maxPatience: 45 });
}

export function stagedGame(shot) {
  if (shot === 'start') {
    const game = basePlaying(11);
    game.phase = 'title';
    addOrder(game, 'nasi-goreng', 0.8);
    addOrder(game, 'mie-ayam', 0.55);
    return game;
  }
  if (shot === 'play') {
    const game = basePlaying(23);
    addOrder(game, 'nasi-goreng', 0.72);
    addOrder(game, 'sate-pedas', 0.4);
    addOrder(game, 'mie-ayam', 0.9);
    game.wok = ['nasi', 'telur'];
    game.wokState = 'assembling';
    game.score = 350;
    game.coins = 27000;
    game.combo = 2;
    game.comboTimer = 5;
    return game;
  }
  if (shot === 'serve') {
    const game = basePlaying(37);
    addOrder(game, 'nasi-goreng', 0.65);
    addOrder(game, 'telur-dadar', 0.5);
    game.wok = ['nasi', 'telur', 'bawang', 'kecap'];
    game.wokState = 'ready';
    game.serveTimer = 3.1;
    game.score = 620;
    game.coins = 41000;
    game.combo = 3;
    game.comboTimer = 6;
    return game;
  }
  if (shot === 'end') {
    const game = basePlaying(51);
    game.phase = 'dayEnd';
    game.timeLeft = 0;
    game.score = 1480;
    game.coins = 83000;
    game.served = 9;
    game.lost = 1;
    game.stats.perfect = 5;
    game.stats.burnt = 1;
    game.day = 1;
    return game;
  }
  return null;
}
