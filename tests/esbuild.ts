import fs from 'fs';
import esbuild from 'esbuild';
import ReplacerPlugin, { replacement } from '../src/esbuild';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import parser from '@babel/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = fs.readFileSync(path.join(__dirname, 'content.ts'), 'utf-8');
const { program } = parser.parse(content, { plugins: ['typescript'] });

replacement.set("CONTENT", program.body);

esbuild.build({
    entryPoints: [path.join(__dirname, 'main.ts')],
    plugins: [
        ReplacerPlugin()
    ],
    outfile: "out.js"
});