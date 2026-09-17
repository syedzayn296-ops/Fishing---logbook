import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b, accentR, accentG, accentB) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(2, 9); // Truecolor (RGB)
  ihdr.writeUInt8(0, 10); // Compression method
  ihdr.writeUInt8(0, 11); // Filter method
  ihdr.writeUInt8(0, 12); // Interlace method

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Raw image data: height scanlines, each with 1 filter byte (0) + width * 3 bytes (RGB)
  const scanlineWidth = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineWidth);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient background and wave/fish stylized emblem
      if (dist < radius) {
        // Inner circle with wave color
        const ratio = (y / height);
        rawData[pxOffset] = Math.round(accentR * (1 - ratio * 0.3));
        rawData[pxOffset + 1] = Math.round(accentG * (1 - ratio * 0.2));
        rawData[pxOffset + 2] = Math.round(accentB);
      } else {
        // Dark midnight ocean navy
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Generate compliant PWA PNGs
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 2, 6, 23, 6, 182, 212));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 2, 6, 23, 6, 182, 212));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 2, 6, 23, 14, 165, 233));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 2, 6, 23, 6, 182, 212));
fs.writeFileSync('public/favicon.ico', createPNG(32, 32, 2, 6, 23, 6, 182, 212));

console.log('PWA icons successfully generated in public/ directory!');
