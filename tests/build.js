import fs from 'fs';
import esbuild from 'esbuild';
import ReplacerPlugin from '../src/index.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { cache } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = fs.readFileSync(path.join(__dirname, 'content.js'), 'utf-8');

cache.set("CONTENT", content);

esbuild.build({
    entryPoints: [path.join(__dirname, 'main.js')],
    plugins: [
        ReplacerPlugin()
    ]
})