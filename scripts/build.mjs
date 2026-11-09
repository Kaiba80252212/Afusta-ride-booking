/* Zero-dependency build: copies the static frontend into dist/.
 * The Vercel project is configured with framework "vite" and outputDirectory
 * "dist" — this satisfies that contract without bundling anything.
 * The /api function is built by Vercel directly from api/index.ts. */
import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const out = join(root, 'dist');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js']) {
  await copyFile(join(root, file), join(out, file));
}
await cp(join(root, 'assets'), join(out, 'assets'), { recursive: true });
console.log('CampusTrike static frontend copied to dist/.');
