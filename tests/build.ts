import fs from 'fs';
import esbuild from 'esbuild';
import ReplacerPlugin, { replacement } from '../src/index.ts';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = fs.readFileSync(path.join(__dirname, 'content.ts'), 'utf-8');

replacement.set("CONTENT", content);

esbuild.build({
    entryPoints: [path.join(__dirname, 'main.ts')],
    plugins: [
        ReplacerPlugin()
    ],
    outfile: "out.js"
});