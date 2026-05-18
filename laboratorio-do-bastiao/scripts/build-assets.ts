import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

async function main(): Promise<void> {
  // ── Sprites (density 4 → 256px frame grid for crisp pixel art) ──────────
  const SPRITES = [
    { svg: 'assets-source/sprites/avatar-human.svg',       out: 'client/public/assets/sprites/avatar-human.png' },
    { svg: 'assets-source/sprites/avatar-agent.svg',       out: 'client/public/assets/sprites/avatar-agent.png' },
    { svg: 'assets-source/sprites/avatar-agent-skins.svg', out: 'client/public/assets/sprites/agent-skins.png' },
    { svg: 'assets-source/sprites/avatars-sitting.svg',    out: 'client/public/assets/sprites/avatars-sitting.png' },
  ] as const;

  for (const { svg, out } of SPRITES) {
    const outPath = path.join(ROOT, out);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await sharp(path.join(ROOT, svg), { density: 288 }).png().toFile(outPath);
    const m = await sharp(outPath).metadata();
    console.log(`✓ ${svg} → ${out} (${m.width}×${m.height}px)`);
  }

  // ── Map: rotate portrait SVG 90° CW → landscape 1280×800 ────────────────
  //   Portrait layout: meetings/depts stacked top→bottom
  //   After 90° CW: reception on LEFT, meetings on RIGHT, left-to-right flow
  const mapSvg = path.join(ROOT, 'assets-source/maps/office-floor-plan.svg');
  const mapOut = path.join(ROOT, 'client/public/assets/maps/office-landscape.png');
  await fs.mkdir(path.dirname(mapOut), { recursive: true });

  await sharp(mapSvg, { density: 144 }) // renders portrait at 1280×1760
    .rotate(90)                          // → landscape 1760×1280
    .resize(1280, 800, { fit: 'fill' }) // stretch to exact game world size
    .png()
    .toFile(mapOut);

  const mm = await sharp(mapOut).metadata();
  const stat = await fs.stat(mapOut);
  console.log(`✓ map (rotated landscape) → ${mapOut} (${mm.width}×${mm.height}px, ${Math.round(stat.size / 1024)}KB)`);

  // ── Furniture tileset ───────────────────────────────────────────────────
  const tileOut = path.join(ROOT, 'client/public/assets/tilesets/furniture.png');
  await fs.mkdir(path.dirname(tileOut), { recursive: true });
  await sharp(path.join(ROOT, 'assets-source/tilesets/furniture-tileset.svg'), { density: 144 }).png().toFile(tileOut);
  const tm = await sharp(tileOut).metadata();
  console.log(`✓ furniture tileset → ${tileOut} (${tm.width}×${tm.height}px)`);
}

main().catch((err) => { console.error(err); process.exit(1); });
