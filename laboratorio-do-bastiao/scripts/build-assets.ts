import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SOURCES = [
  { svg: 'assets-source/maps/office-floor-plan.svg',     out: 'client/public/assets/maps/office.png',             density: 2 },
  { svg: 'assets-source/sprites/avatar-human.svg',        out: 'client/public/assets/sprites/avatar-human.png',    density: 4 },
  { svg: 'assets-source/sprites/avatar-agent.svg',        out: 'client/public/assets/sprites/avatar-agent.png',    density: 4 },
  { svg: 'assets-source/sprites/avatar-agent-skins.svg',  out: 'client/public/assets/sprites/agent-skins.png',     density: 4 },
  { svg: 'assets-source/sprites/avatars-sitting.svg',     out: 'client/public/assets/sprites/avatars-sitting.png', density: 4 },
  { svg: 'assets-source/tilesets/furniture-tileset.svg',  out: 'client/public/assets/tilesets/furniture.png',      density: 2 },
] as const;

async function main(): Promise<void> {
  for (const { svg, out, density } of SOURCES) {
    const svgPath = path.join(ROOT, svg);
    const outPath = path.join(ROOT, out);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await sharp(svgPath, { density: 72 * density }).png().toFile(outPath);
    const stat = await fs.stat(outPath);
    const meta = await sharp(outPath).metadata();
    console.log(`✓ ${svg} → ${out} (${meta.width}×${meta.height}px, ${Math.round(stat.size / 1024)}KB)`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
