// Dapur Senja — Warung Rush: configuration.
// Every tunable number of the game lives here so the rest of the code
// reads plain values instead of magic numbers.

export const VIEW = { w: 1280, h: 720 };

// One in-game day lasts this long (seconds). The timer on the order board
// counts it down; when it hits zero the day ends and the summary shows.
export const DAY_SECONDS = 150;

// How long a fresh order waits before the customer walks away (seconds).
// Later days shorten it: each day multiplies it by PATIENCE_DAY_FACTOR.
export const ORDER_PATIENCE = 45;
export const PATIENCE_DAY_FACTOR = 0.88;

// Seconds between new orders arriving, and how many may wait at once.
export const ORDER_EVERY = 12;
export const MAX_ORDERS = 3;

// Cooking: seconds on the wok before the dish is done, and how long the
// "ready to serve" window stays open before the dish burns.
export const COOK_SECONDS = 2.4;
export const SERVE_WINDOW = 4.0;

// Lives: an expired order or a burnt dish thrown away costs one heart.
export const HEARTS = 3;

// Scoring: base points per served dish, plus up to this bonus for serving
// while the customer still has patience left. A combo grows by one for
// every dish served within COMBO_WINDOW seconds of the previous serve.
export const SERVE_BASE = 100;
export const SERVE_PATIENCE_BONUS = 50;
export const COMBO_WINDOW = 8;
export const COMBO_STEP = 25;

// The eight ingredients on the counter, in bin order. `key` is the keyboard
// shortcut, `color` the bin's accent, `icon` the shape render.js draws.
export const INGREDIENTS = [
  { id: 'nasi',   name: 'Nasi',   key: '1', color: '#f5efe0', icon: 'rice' },
  { id: 'mie',    name: 'Mie',    key: '2', color: '#f2c14e', icon: 'noodle' },
  { id: 'ayam',   name: 'Ayam',   key: '3', color: '#c97b4a', icon: 'drumstick' },
  { id: 'telur',  name: 'Telur',  key: '4', color: '#fff3c4', icon: 'egg' },
  { id: 'sayur',  name: 'Sayur',  key: '5', color: '#5da24a', icon: 'leaf' },
  { id: 'bawang', name: 'Bawang', key: '6', color: '#b678c2', icon: 'shallot' },
  { id: 'kecap',  name: 'Kecap',  key: '7', color: '#4a2c1a', icon: 'bottle' },
  { id: 'cabai',  name: 'Cabai',  key: '8', color: '#d9382b', icon: 'chili' },
];

// The menu: every dish is a set of ingredients. Adding exactly this set to
// the wok (in any order) makes the dish; anything else is a ruined mix.
export const DISHES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', price: 15000, needs: ['nasi', 'telur', 'bawang', 'kecap'] },
  { id: 'mie-ayam',     name: 'Mie Ayam',     price: 12000, needs: ['mie', 'ayam', 'sayur', 'bawang'] },
  { id: 'sate-pedas',   name: 'Sate Pedas',   price: 18000, needs: ['ayam', 'kecap', 'cabai'] },
  { id: 'telur-dadar',  name: 'Telur Dadar',  price: 8000,  needs: ['telur', 'sayur', 'bawang'] },
  { id: 'nasi-ayam',    name: 'Nasi Ayam',    price: 14000, needs: ['nasi', 'ayam', 'kecap'] },
];

export function ingredientById(id) {
  return INGREDIENTS.find((ing) => ing.id === id);
}

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}

// Warm dusk palette for the warung: brick, wood, lamplight, chalkboard.
export const COLORS = {
  wall: '#7a4a35',
  wallDark: '#5f3828',
  brick: '#8a5540',
  floor: '#6b4a2f',
  counter: '#a4713f',
  counterTop: '#c08d55',
  board: '#2e4038',
  boardFrame: '#8a6a42',
  chalk: '#f2f0d8',
  wok: '#3a3a3f',
  plate: '#f7f3e8',
  cream: '#fff6e0',
  ink: '#2b2118',
  gold: '#f2c14e',
  red: '#d9382b',
  green: '#5da24a',
};
