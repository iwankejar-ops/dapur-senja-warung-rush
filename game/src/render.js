// Dapur Senja — Warung Rush: all canvas drawing.
// One canvas, no images: the warung (brick wall, dusk window, hanging
// lamp, wooden counter), the chalk order board, the ingredient bins, the
// wok and the plates are drawn from shapes every frame. Nothing here
// mutates the game state; it only reads it.

import { COLORS, VIEW, HEARTS, DAY_TIMER_WARN, COOK_SECONDS, SERVE_WINDOW, INGREDIENTS, DISHES, ingredientById, dishById } from './config.js';
import { wokDish, wokRuined, matchingOrder, describeWok } from './world.js';

// A finished dish drawn on the serving plate: a small mound of the dish's
// own ingredients, so the plate reads as food without any emoji glyph.
function drawPlatedDish(ctx, dish, x, y) {
  const colors = { nasi: '#f5efe0', mie: '#f2c14e', ayam: '#c97b4a', telur: '#fff3c4', sayur: '#5da24a', bawang: '#b678c2', kecap: '#4a2c1a', cabai: '#d9382b' };
  ctx.fillStyle = '#f5efe0';
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 12, 0, Math.PI, 0);
  ctx.fill();
  dish.needs.forEach((id, i) => {
    ctx.fillStyle = colors[id] || '#fff';
    ctx.beginPath();
    ctx.arc(x - 16 + i * 11, y - 6 - (i % 2) * 4, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- ingredient icons (drawn, ~40px box centred on x, y) -----------------
export function drawIcon(ctx, icon, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(43,33,24,0.55)';
  if (icon === 'rice') {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath();
    ctx.ellipse(0, 2, 17, 11, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath();
    ctx.arc(0, 2, 17, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d8cdb2';
    ctx.beginPath();
    ctx.moveTo(-12, -2); ctx.lineTo(-6, -8); ctx.moveTo(-2, -3); ctx.lineTo(3, -9); ctx.moveTo(8, -2); ctx.lineTo(13, -7);
    ctx.stroke();
    ctx.fillStyle = '#c65a3c';
    ctx.beginPath();
    ctx.ellipse(0, 6, 19, 6, 0, 0, Math.PI);
    ctx.fill();
  } else if (icon === 'noodle') {
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c98f1b';
    ctx.lineWidth = 2.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-13, i * 5);
      ctx.bezierCurveTo(-6, i * 5 - 4, 6, i * 5 + 4, 13, i * 5);
      ctx.stroke();
    }
    ctx.fillStyle = '#c65a3c';
    ctx.beginPath();
    ctx.ellipse(0, 8, 19, 5, 0, 0, Math.PI);
    ctx.fill();
  } else if (icon === 'drumstick') {
    ctx.fillStyle = '#c97b4a';
    ctx.beginPath();
    ctx.ellipse(-2, -2, 13, 10, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f7f3e8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(8, 4); ctx.lineTo(16, 12);
    ctx.stroke();
    ctx.fillStyle = '#f7f3e8';
    ctx.beginPath();
    ctx.arc(17, 13, 3.5, 0, Math.PI * 2);
    ctx.arc(13, 16, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'egg') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 13, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath();
    ctx.arc(2, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'leaf') {
    ctx.fillStyle = '#5da24a';
    for (const a of [-0.6, 0, 0.6]) {
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -8, 6.5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#3f7a32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 4); ctx.lineTo(0, 14);
    ctx.stroke();
  } else if (icon === 'shallot') {
    ctx.fillStyle = '#b678c2';
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.bezierCurveTo(11, -6, 12, 6, 0, 14);
    ctx.bezierCurveTo(-12, 6, -11, -6, 0, -15);
    ctx.fill();
    ctx.strokeStyle = '#8a4f96';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -14); ctx.quadraticCurveTo(3, 0, 0, 13);
    ctx.stroke();
    ctx.fillStyle = '#5da24a';
    ctx.beginPath();
    ctx.ellipse(0, -15, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (icon === 'bottle') {
    ctx.fillStyle = '#2e1a0e';
    rr(ctx, -7, -6, 14, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#4a2c1a';
    ctx.fillRect(-4, -15, 8, 10);
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(-7, 2, 14, 8);
    ctx.fillStyle = '#2b2118';
    ctx.font = '700 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KECAP', 0, 6);
  } else if (icon === 'chili') {
    ctx.fillStyle = '#d9382b';
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.quadraticCurveTo(2, -16, 15, 2);
    ctx.quadraticCurveTo(6, 12, -8, 10);
    ctx.quadraticCurveTo(-16, 6, -14, -6);
    ctx.fill();
    ctx.strokeStyle = '#5da24a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(13, 0); ctx.quadraticCurveTo(18, -6, 16, -11);
    ctx.stroke();
  }
  ctx.restore();
}

// --- background: the warung at dusk ---------------------------------------
function drawWall(ctx, t) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW.w, 440);
  // Brick courses.
  ctx.fillStyle = COLORS.brick;
  for (let row = 0; row < 7; row++) {
    const y = 14 + row * 62;
    for (let x = -40 + (row % 2) * 60; x < VIEW.w; x += 120) {
      ctx.fillRect(x, y, 112, 54);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let row = 0; row < 7; row++) ctx.fillRect(0, 10 + row * 62, VIEW.w, 4);
  // Dusk window with a sleepy street outside. It sits between the shelf
  // and the score panel so nothing overlaps it.
  ctx.fillStyle = '#3a2b3f';
  rr(ctx, 700, 36, 240, 180, 10);
  ctx.fill();
  const sky = ctx.createLinearGradient(0, 44, 0, 208);
  sky.addColorStop(0, '#f2a35e');
  sky.addColorStop(0.55, '#c65a6e');
  sky.addColorStop(1, '#5a3a63');
  ctx.fillStyle = sky;
  ctx.fillRect(708, 44, 224, 164);
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(780, 90, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(708, 168, 224, 40);
  ctx.fillStyle = '#f2c14e';
  for (const wx of [730, 795, 860, 910]) {
    ctx.fillRect(wx, 178, 10, 12);
  }
  // Hanging lamp, gently swaying.
  const sway = Math.sin(t * 0.8) * 4;
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(640 + sway, 0); ctx.lineTo(640 + sway, 58);
  ctx.stroke();
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.arc(640 + sway, 74, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(242,193,78,0.16)';
  ctx.beginPath();
  ctx.arc(640 + sway, 74, 90, 0, Math.PI * 2);
  ctx.fill();
  // Floor.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 440, VIEW.w, 280);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let x = 0; x < VIEW.w; x += 160) ctx.fillRect(x, 440, 3, 280);
  // Shelf with jars above the counter, left of the window.
  ctx.fillStyle = '#8a6a42';
  ctx.fillRect(420, 96, 220, 10);
  const jars = ['#c65a3c', '#5da24a', '#f2c14e', '#b678c2'];
  jars.forEach((c, i) => {
    ctx.fillStyle = c;
    rr(ctx, 432 + i * 52, 58, 36, 38, 6);
    ctx.fill();
    ctx.fillStyle = '#f7f3e8';
    ctx.fillRect(438 + i * 52, 70, 24, 12);
  });
}

function drawBoard(ctx, game, t) {
  // Chalkboard with the waiting orders.
  ctx.fillStyle = COLORS.boardFrame;
  rr(ctx, 36, 28, 352, 236, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.board;
  rr(ctx, 46, 38, 332, 216, 8);
  ctx.fill();
  text(ctx, 'PESANAN', 212, 62, 22, COLORS.chalk, 'center', '800');
  ctx.strokeStyle = 'rgba(242,240,216,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 80); ctx.lineTo(354, 80);
  ctx.stroke();
  if (game.orders.length === 0) {
    text(ctx, 'Belum ada pesanan...', 212, 150, 17, 'rgba(242,240,216,0.65)');
    text(ctx, 'tunggu pelanggan datang', 212, 178, 15, 'rgba(242,240,216,0.45)');
  }
  game.orders.forEach((order, i) => {
    const dish = dishById(order.dishId);
    const y = 106 + i * 50;
    const frac = Math.max(0, order.patience / order.maxPatience);
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)';
    rr(ctx, 58, y - 18, 308, 42, 8);
    ctx.fill();
    text(ctx, dish.name, 72, y + 1, 17, COLORS.chalk, 'left', '800');
    text(ctx, `Rp${dish.price.toLocaleString('id-ID')}`, 354, y + 1, 14, COLORS.gold, 'right');
    // Patience bar under the ticket.
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    rr(ctx, 72, y + 10, 280, 6, 3);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#7ec850' : frac > 0.25 ? '#f2c14e' : '#d9382b';
    if (frac > 0) {
      rr(ctx, 72, y + 10, 280 * frac, 6, 3);
      ctx.fill();
    }
    // Recipe dots: the ingredients the dish needs.
    dish.needs.forEach((id, j) => {
      const ing = ingredientById(id);
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.arc(70 + j * 14, y - 12, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function drawHud(ctx, game) {
  // Score, coins, day timer and hearts, top right. Narrower than the
  // first draft so it never covers the dusk window.
  ctx.fillStyle = 'rgba(43,33,24,0.55)';
  rr(ctx, 960, 28, 284, 108, 12);
  ctx.fill();
  const mins = Math.floor(game.timeLeft / 60);
  const secs = Math.floor(game.timeLeft % 60);
  text(ctx, `${mins}:${String(secs).padStart(2, '0')}`, 1102, 62, 30, game.timeLeft < DAY_TIMER_WARN ? '#ff8a7a' : COLORS.cream);
  text(ctx, 'SKOR', 978, 52, 12, '#d8c9a8', 'left');
  text(ctx, String(game.score), 978, 78, 24, COLORS.cream, 'left');
  text(ctx, 'Rp' + game.coins.toLocaleString('id-ID'), 978, 108, 15, COLORS.gold, 'left');
  text(ctx, `HARI ${game.day}`, 1224, 52, 13, '#d8c9a8', 'right');
  // Hearts.
  for (let i = 0; i < HEARTS; i++) {
    const x = 1180 + i * 22 - 22;
    ctx.fillStyle = i < game.hearts ? '#e0483e' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x - 5, 96, 7, 0, Math.PI * 2);
    ctx.arc(x + 5, 96, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 11, 96); ctx.lineTo(x, 110); ctx.lineTo(x + 11, 96);
    ctx.closePath();
    ctx.fill();
  }
  if (game.combo > 1) {
    text(ctx, `KOMBO x${game.combo}`, 1102, 152, 18, COLORS.gold, 'center', '800');
  }
}

function drawCounter(ctx, game) {
  // Wooden counter with the eight ingredient bins.
  ctx.fillStyle = COLORS.counter;
  ctx.fillRect(0, 470, VIEW.w, 170);
  ctx.fillStyle = COLORS.counterTop;
  ctx.fillRect(0, 470, VIEW.w, 16);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 486, VIEW.w, 4);
  text(ctx, 'BAHAN — klik atau tekan 1–8', 640, 500, 15, '#e8d9b8', 'center', '700');
  INGREDIENTS.forEach((ing, i) => {
    const x = 90 + i * 140;
    const y = 560;
    const inWok = game.wok.includes(ing.id);
    ctx.fillStyle = inWok ? 'rgba(242,193,78,0.25)' : 'rgba(0,0,0,0.22)';
    rr(ctx, x - 58, y - 46, 116, 92, 12);
    ctx.fill();
    ctx.strokeStyle = inWok ? COLORS.gold : 'rgba(255,246,224,0.5)';
    ctx.lineWidth = inWok ? 3 : 2;
    rr(ctx, x - 58, y - 46, 116, 92, 12);
    ctx.stroke();
    drawIcon(ctx, ing.icon, x, y - 8, 1.15);
    text(ctx, ing.name, x, y + 26, 14, COLORS.cream);
    text(ctx, ing.key, x + 44, y - 34, 12, '#d8c9a8');
  });
}

function drawWokStation(ctx, game, t) {
  // The wok in the middle of the kitchen, the plate, and the action buttons.
  // cy sits high enough that the buttons land above the counter top.
  const cx = 640;
  const cy = 300;
  // Stove.
  ctx.fillStyle = '#4a4038';
  rr(ctx, cx - 170, cy + 40, 340, 60, 10);
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.beginPath();
  ctx.arc(cx - 110, cy + 70, 16, 0, Math.PI * 2);
  ctx.arc(cx + 110, cy + 70, 16, 0, Math.PI * 2);
  ctx.fill();
  // Wok: a shallow bowl, not a flat disc — a full dark body first (so no
  // gap shows between rim and bowl), then the rim ring and the darker
  // inner surface the ingredients sit in.
  const bubbling = game.wokState === 'cooking' ? Math.sin(t * 14) * 3 : 0;
  ctx.fillStyle = COLORS.wok;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14, 122, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a4a52';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 120, 30, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#2b2b30';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 104, 24, 0, Math.PI, 0);
  ctx.fill();
  // Wok handle to the right.
  ctx.fillStyle = '#2b2118';
  rr(ctx, cx + 118, cy + 2, 34, 10, 5);
  ctx.fill();
  // What's inside the wok.
  if (game.wok.length > 0) {
    const colors = { nasi: '#f5efe0', mie: '#f2c14e', ayam: '#c97b4a', telur: '#fff3c4', sayur: '#5da24a', bawang: '#b678c2', kecap: '#4a2c1a', cabai: '#d9382b' };
    game.wok.forEach((id, i) => {
      ctx.fillStyle = colors[id] || '#fff';
      ctx.beginPath();
      ctx.arc(cx - 66 + i * 34 + (i % 2) * 8, cy + 8 + bubbling * (i % 2 ? 1 : -1), 13, 0, Math.PI * 2);
      ctx.fill();
    });
    if (game.wokState === 'cooking') {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const sx = cx - 50 + i * 50;
        const sy = cy - 18 - ((t * 30 + i * 22) % 26);
        ctx.beginPath();
        ctx.moveTo(sx, sy + 8);
        ctx.quadraticCurveTo(sx + 6, sy, sx, sy - 8);
        ctx.stroke();
      }
    }
  }
  // State label + progress.
  const stateText = {
    empty: 'Wok kosong',
    assembling: describeWok(game),
    cooking: 'Memasak...',
    ready: 'MATANG! Sajikan sekarang!',
    burnt: 'GOSONG!',
    ruined: 'Campuran salah!',
  }[game.wokState];
  text(ctx, stateText, cx, cy - 42, 18, game.wokState === 'ready' ? COLORS.gold : game.wokState === 'burnt' || game.wokState === 'ruined' ? '#ff8a7a' : COLORS.cream, 'center', '800');
  if (game.wokState === 'cooking') {
    const frac = 1 - game.cookTimer / COOK_SECONDS;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    rr(ctx, cx - 90, cy - 30, 180, 10, 5);
    ctx.fill();
    ctx.fillStyle = COLORS.gold;
    rr(ctx, cx - 90, cy - 30, 180 * Math.max(0, frac), 10, 5);
    ctx.fill();
  } else if (game.wokState === 'ready') {
    const frac = Math.max(0, game.serveTimer / SERVE_WINDOW);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    rr(ctx, cx - 90, cy - 30, 180, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#7ec850';
    rr(ctx, cx - 90, cy - 30, 180 * frac, 10, 5);
    ctx.fill();
  }
  // Serving plate on the right of the wok.
  const px = cx + 220;
  ctx.fillStyle = COLORS.plate;
  ctx.beginPath();
  ctx.ellipse(px, cy + 26, 62, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8dfc8';
  ctx.beginPath();
  ctx.ellipse(px, cy + 24, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  const dish = wokDish(game);
  if (dish && (game.wokState === 'ready' || game.wokState === 'cooking')) {
    drawPlatedDish(ctx, dish, px, cy + 20);
  }
  text(ctx, 'PIRING SAJI', px, cy + 62, 13, '#e8d9b8', 'center', '700');

  // Action buttons under the stove.
  drawButton(ctx, { x: cx - 250, y: cy + 118, w: 140, h: 44, label: 'MASAK [Spasi]', enabled: game.wokState === 'assembling' && !!wokDish(game), accent: '#c65a3c' });
  drawButton(ctx, { x: cx - 70, y: cy + 118, w: 140, h: 44, label: 'SAJIKAN [Enter]', enabled: !!matchingOrder(game), accent: '#5da24a' });
  drawButton(ctx, { x: cx + 110, y: cy + 118, w: 140, h: 44, label: 'BUANG [B]', enabled: game.wok.length > 0, accent: '#6b5a44' });
}

function drawButton(ctx, { x, y, w, h, label, enabled, accent }) {
  ctx.fillStyle = enabled ? accent : 'rgba(0,0,0,0.35)';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = enabled ? 'rgba(255,246,224,0.85)' : 'rgba(255,246,224,0.3)';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 10);
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, 14, enabled ? '#fff6e0' : 'rgba(255,246,224,0.5)', 'center', '800');
}

function drawFlash(ctx, game) {
  if (game.flashTimer <= 0 || !game.flash) return;
  ctx.globalAlpha = Math.min(1, game.flashTimer);
  text(ctx, game.flash, 640, 210, 24, COLORS.gold, 'center', '800');
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, game, t) {
  ctx.fillStyle = 'rgba(30,18,12,0.72)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  text(ctx, 'DAPUR SENJA', 640, 210, 72, COLORS.gold, 'center', '900');
  text(ctx, '— Warung Rush —', 640, 268, 26, COLORS.cream, 'center', '700');
  text(ctx, 'Masak pesanan pelanggan sebelum mereka pergi!', 640, 320, 20, '#e8d9b8');
  text(ctx, 'Klik bahan (atau tekan 1–8) → MASAK [Spasi] → SAJIKAN [Enter]', 640, 356, 18, COLORS.cream);
  text(ctx, 'Sajikan selagi pelanggan sabar untuk bonus. 3 hati. Satu hari = 150 detik.', 640, 384, 16, '#d8c9a8');
  const pulse = 0.75 + Math.sin(t * 3) * 0.25;
  ctx.globalAlpha = pulse;
  drawButton(ctx, { x: 520, y: 430, w: 240, h: 56, label: 'MULAI MASAK', enabled: true, accent: '#c65a3c' });
  ctx.globalAlpha = 1;
  text(ctx, 'M: suara hidup/mati · P: jeda · R: ulang', 640, 530, 14, '#d8c9a8');
}

function drawEnd(ctx, game, title, lines) {
  ctx.fillStyle = 'rgba(30,18,12,0.78)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  text(ctx, title, 640, 200, 56, COLORS.gold, 'center', '900');
  lines.forEach((line, i) => text(ctx, line, 640, 280 + i * 36, 20, COLORS.cream));
  drawButton(ctx, { x: 520, y: 470, w: 240, h: 56, label: 'MAIN LAGI [R]', enabled: true, accent: '#5da24a' });
}

export function drawGame(ctx, game, t) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawWall(ctx, t);
  drawBoard(ctx, game, t);
  drawHud(ctx, game);
  drawWokStation(ctx, game, t);
  drawCounter(ctx, game);
  // Bottom help strip.
  ctx.fillStyle = 'rgba(43,33,24,0.6)';
  ctx.fillRect(0, 660, VIEW.w, 60);
  text(ctx, describeWok(game) + '   ·   Spasi: masak · Enter: sajikan · B: buang · P: jeda', 640, 690, 15, '#e8d9b8');
  drawFlash(ctx, game);
  if (game.phase === 'title') drawTitle(ctx, game, t);
  if (game.phase === 'paused') {
    ctx.fillStyle = 'rgba(30,18,12,0.6)';
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    text(ctx, 'JEDA — tekan P untuk lanjut', 640, 360, 32, COLORS.cream, 'center', '800');
  }
  if (game.phase === 'dayEnd') {
    drawEnd(ctx, game, `Hari ${game.day} selesai!`, [
      `Skor: ${game.score} · Uang masuk: Rp${game.coins.toLocaleString('id-ID')}`,
      `Pesanan tersaji: ${game.served} · pelanggan pergi: ${game.lost}`,
      `Sajian sempurna: ${game.stats.perfect} · gosong: ${game.stats.burnt}`,
    ]);
  }
  if (game.phase === 'gameOver') {
    drawEnd(ctx, game, 'Warung tutup...', [
      `Semua pelanggan pergi. Skor akhir: ${game.score}`,
      `Pesanan tersaji: ${game.served} · uang masuk: Rp${game.coins.toLocaleString('id-ID')}`,
      'Besok coba lagi — pelanggan suka yang cepat!',
    ]);
  }
}
