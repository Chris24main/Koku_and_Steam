import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlPath = path.join(root, 'index.html');
const v3Path = path.join(root, 'v3_core.js');
const v4Path = path.join(root, 'v4_expansion.js');
const outPath = path.join(root, 'koku_steam_mitochondrial_village_simulation_V6.html');

const html = fs.readFileSync(htmlPath, 'utf8');
const v3 = fs.readFileSync(v3Path, 'utf8');
const v4 = fs.readFileSync(v4Path, 'utf8');

const v3Tag = /<script\s+src="v3_core\.js"><\/script>/;
const v4Tag = /<script\s+src="v4_expansion\.js"><\/script>/;

if (!v3Tag.test(html) || !v4Tag.test(html)) {
    console.error('Error: Expected <script src="v3_core.js"> and <script src="v4_expansion.js"> tags in index.html');
    process.exit(1);
}

const bundled = html
    .replace(v3Tag, () => `<script>\n${v3}\n</script>`)
    .replace(v4Tag, () => `<script>\n${v4}\n</script>`);

if (v3Tag.test(bundled) || v4Tag.test(bundled)) {
    console.error('Error: Unresolved script tags remain after bundling');
    process.exit(1);
}

fs.writeFileSync(outPath, bundled, 'utf8');
const size = fs.statSync(outPath).size;
console.log(`Bundled ${path.basename(outPath)} (${size} bytes)`);
