// Generates public/apple-touch-icon.png (180 px) and public/og-image.png (1200×630)
// from SVG, using sharp (installed with Astro). Run: node scripts/make-icons.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (f) => path.join(root, 'public', f);

const rings = (cx, cy, r, w) => `
  <circle cx="${cx - r * 0.6}" cy="${cy - r * 0.45}" r="${r}" fill="none" stroke="#375D52" stroke-width="${w}"/>
  <circle cx="${cx + r * 0.6}" cy="${cy - r * 0.45}" r="${r}" fill="none" stroke="#2AACCC" stroke-width="${w}"/>
  <circle cx="${cx}" cy="${cy + r * 0.6}" r="${r}" fill="none" stroke="#1A3A6A" stroke-width="${w}"/>`;

// Apple touch icon: white square (iOS rounds the corners itself), rings centered
const touch = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" fill="#ffffff"/>
  ${rings(90, 92, 40, 13)}
</svg>`;

// Share image: ESA green, headline, ring mark on a white disc
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#375D52"/>
  <circle cx="1060" cy="540" r="260" fill="none" stroke="#8DC4A0" stroke-opacity=".18" stroke-width="40"/>
  <circle cx="160" cy="170" r="70" fill="#ffffff"/>
  ${rings(160, 170, 30, 10)}
  <text x="90" y="372" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="#ffffff">Home of the</text>
  <text x="90" y="472" font-family="Georgia, 'Times New Roman', serif" font-size="92" font-style="italic" fill="#8DC4A0">EconCats.</text>
  <text x="92" y="550" font-family="Segoe UI, Arial, sans-serif" font-size="30" letter-spacing="3" fill="#ffffff" fill-opacity=".85">ECONOMICS STUDENT ASSOCIATION · UNIVERSITY OF ARIZONA</text>
</svg>`;

await sharp(Buffer.from(touch)).png().toFile(out('apple-touch-icon.png'));
await sharp(Buffer.from(og)).png().toFile(out('og-image.png'));
console.log('Wrote public/apple-touch-icon.png and public/og-image.png');
