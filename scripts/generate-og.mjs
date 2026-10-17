/**
 * Generates public/og-image.png — the 1200×630 image Facebook shows when the
 * site is shared. Pure Node (zlib), no dependencies.
 *
 * Run: node scripts/generate-og.mjs
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 1200;
const H = 630;
const px = new Uint8Array(W * H * 4);

/* ---------------------------------------------------------------- */
/* tiny 5×7 bitmap font (uppercase + digits + a few symbols)         */
/* ---------------------------------------------------------------- */
const FONT = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01111],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  "&": [0b01100, 0b10010, 0b10100, 0b01000, 0b10101, 0b10010, 0b01101],
  ".": [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00110, 0b00110],
  "-": [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  " ": [0, 0, 0, 0, 0, 0, 0],
};

/* ---------------------------------------------------------------- */
/* drawing helpers                                                   */
/* ---------------------------------------------------------------- */
function set(x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  const alpha = a / 255;
  px[i] = Math.round(px[i] * (1 - alpha) + r * alpha);
  px[i + 1] = Math.round(px[i + 1] * (1 - alpha) + g * alpha);
  px[i + 2] = Math.round(px[i + 2] * (1 - alpha) + b * alpha);
  px[i + 3] = 255;
}

function circle(cx, cy, radius, [r, g, b], alpha = 255) {
  for (let y = Math.floor(cy - radius); y <= cy + radius; y += 1) {
    for (let x = Math.floor(cx - radius); x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) set(x, y, r, g, b, alpha);
    }
  }
}

function polygon(points, [r, g, b], alpha = 255) {
  const minY = Math.min(...points.map((p) => p[1]));
  const maxY = Math.max(...points.map((p) => p[1]));
  for (let y = minY; y <= maxY; y += 1) {
    const xs = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    xs.sort((a, c) => a - c);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x += 1) set(x, y, r, g, b, alpha);
    }
  }
}

function text(str, x, y, scale, [r, g, b]) {
  let cursor = x;
  for (const raw of str.toUpperCase()) {
    const glyph = FONT[raw] ?? FONT[" "];
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if (glyph[row] & (1 << (4 - col))) {
          for (let sy = 0; sy < scale; sy += 1) {
            for (let sx = 0; sx < scale; sx += 1) {
              set(cursor + col * scale + sx, y + row * scale + sy, r, g, b);
            }
          }
        }
      }
    }
    cursor += 6 * scale;
  }
  return cursor;
}

function textWidth(str, scale) {
  return str.length * 6 * scale;
}

/* ---------------------------------------------------------------- */
/* the image                                                         */
/* ---------------------------------------------------------------- */
// background: warm cream → blush gradient
for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    const t = (x / W) * 0.6 + (y / H) * 0.4;
    set(
      x,
      y,
      Math.round(253 - t * 8),
      Math.round(247 - t * 18),
      Math.round(240 - t * 22),
    );
  }
}

// soft decorative blobs
circle(120, 90, 170, [249, 225, 232], 170);
circle(1120, 560, 200, [233, 239, 226], 150);

// bouquet illustration (right side)
const bx = 1000;
const by = 320;
polygon(
  [
    [bx, by + 150],
    [bx - 150, by - 30],
    [bx - 70, by - 110],
    [bx, by + 40],
  ],
  [244, 203, 215],
);
polygon(
  [
    [bx, by + 150],
    [bx + 150, by - 30],
    [bx + 70, by - 110],
    [bx, by + 40],
  ],
  [238, 176, 193],
);
polygon(
  [
    [bx - 55, by + 145],
    [bx + 55, by + 145],
    [bx + 26, by + 250],
    [bx - 26, by + 250],
  ],
  [208, 112, 139],
);

const blooms = [
  [-70, -50, 42, [208, 112, 139]],
  [0, -80, 46, [242, 175, 194]],
  [70, -50, 42, [246, 198, 210]],
  [-40, 10, 38, [238, 176, 193]],
  [40, 10, 38, [247, 201, 72]],
  [0, 45, 34, [255, 247, 245]],
];
for (const [dx, dy, r, color] of blooms) {
  circle(bx + dx, by + dy, r, color);
  circle(bx + dx, by + dy, Math.round(r * 0.45), [255, 243, 214]);
}

// ribbon
circle(bx, by + 148, 20, [201, 162, 39]);

// text block (left side)
const ink = [62, 48, 40];
const blush = [147, 64, 90];
const line1 = "CREATE YOUR OWN";
const line2 = "FLOWER & BOOK";
const line3 = "BOUQUET";
const scale1 = 8;
const scale2 = 9;
text(line1, 80, 165, scale1, blush);
text(line2, 80, 255, scale2, ink);
text(line3, 80, 350, 13, ink);
text("BLOOM & BEYOND", 80, 500, 6, [107, 79, 58]);

/* ---------------------------------------------------------------- */
/* PNG encode                                                        */
/* ---------------------------------------------------------------- */
function crc32(buffer) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n += 1) {
    c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const byte of buffer) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y += 1) {
  raw[y * (W * 4 + 1)] = 0;
  Buffer.from(px.buffer, y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // colour type RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "og-image.png");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
