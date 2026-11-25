# dapur-senja-warung-rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/iwankejar-ops/dapur-senja-warung-rush/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/iwankejar-ops/dapur-senja-warung-rush/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Dapur Senja — Warung Rush**: a fast, original Indonesian street-food cooking game. Run a dusk warung stall: customers pin orders on the chalkboard, you pick fresh ingredients from the counter, cook them in the wok, and serve each dish while the customer still has patience. Serve fast for combos, don't let the wok burn, and survive the whole 150-second day.

## Run it

```sh
python3 -m http.server 8080 --directory game
```

Then open http://localhost:8080 in a desktop browser. No build step, no network requests — the game is plain static files, and every sound is synthesized with Web Audio.

## How to play

- **Pick ingredients** — click a bin on the counter, or press keys **1–8**. Each dish needs an exact set of ingredients (see the recipe dots on its order ticket).
- **Cook** — press **Space** (or the MASAK button) once the wok holds a complete dish. The dish needs 2.4 seconds on the wok.
- **Serve** — press **Enter** (or SAJIKAN) while the dish is in its green serving window. Serving with patience left earns a bonus; a fast streak builds a combo.
- **Trash** — press **B** to throw a wrong mix or a burnt dish away.
- **Pause** — **P**. **Mute** — **M**. **Restart** — **R**.

Five dishes on the menu: Nasi Goreng, Mie Ayam, Sate Pedas, Telur Dadar and Nasi Ayam. Three hearts: a customer who walks away costs one. The day ends after 150 seconds — or when the last heart is gone.

## Files

- `game/index.html` + `game/src/*.js` — the whole game (canvas 2D, ES modules, no libraries).
- `game/src/config.js` — dishes, ingredients, timers and the dusk palette.
- `game/src/world.js` — orders, the wok, scoring and the day loop.
- `game/src/render.js` — every pixel: the warung, the board, the bins, the wok.
- `game/src/audio.js` — synthesized Web Audio effects (no audio files).
- `game/src/input.js` — mouse and keyboard.
- `game/src/shots.js` — `?shot=start|play|serve|end` stages fixed states for screenshots.
- `main.ts` — the make.fun hand-in program (Node 22): copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `screenshots/` — real renders of the game's own code.

---

<sub>Entered on [make.fun](https://make.fun/?ref=iwankejar-ops&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
