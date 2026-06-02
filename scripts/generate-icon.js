/**
 * Generates a minimal 16x16 PNG tray icon using only Node.js built-ins.
 * Runs automatically via `postinstall`.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcVal]);
}

function createPNG(w, h, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0; // filter none
    for (let x = 0; x < w; x++) {
      const off = y * (w * 3 + 1) + 1 + x * 3;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const iconPath = path.join(assetsDir, 'icon.png');
if (!fs.existsSync(iconPath)) {
  fs.writeFileSync(iconPath, createPNG(16, 16, 255, 204, 0)); // gold #FFCC00
  console.log('✓ Jarvis: tray icon created at assets/icon.png');
}
