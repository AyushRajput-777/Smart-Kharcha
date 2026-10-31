import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal PNG encoder using pure Node.js zlib
function createSolidColorPng(width, height, r, g, b, a = 255) {
  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function writeChunk(type, data) {
    const len = data.length;
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const header = Buffer.alloc(8);
    header.writeUInt32BE(len, 0);
    typeBuf.copy(header, 4);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([header, data, crcBuf]);
  }

  // Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = writeChunk('IHDR', ihdr);

  // Raw image data with row filter 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Draw a nice styled icon: center circle and border
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.44;

      if (dist < radius) {
        // Emerald green
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = a;
        
        // Add a lighter inner circle and white Rupee mark
        if (dist > radius * 0.85 && dist < radius * 0.95) {
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
        }
      } else {
        // Transparent outside rounded corner or full bleed for maskable
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = writeChunk('IDAT', compressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Emerald Green (5, 150, 105)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSolidColorPng(192, 192, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSolidColorPng(512, 512, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createSolidColorPng(512, 512, 4, 120, 87));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSolidColorPng(180, 180, 5, 150, 105));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createSolidColorPng(32, 32, 5, 150, 105));

console.log('Generated PNG icons successfully in public/');
