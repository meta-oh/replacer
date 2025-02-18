import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import parser from '@babel/parser';
import * as babel from '@babel/core';
import BabelReplacerPlugin, { replacement } from '../src/babel';

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = fs.readFileSync(path.join(__dirname, 'content.ts'), 'utf-8');
const { program } = parser.parse(content, { sourceType: 'module', plugins: ['typescript'] });

replacement.set("CONTENT", program.body);

const inputCode = fs.readFileSync(path.join(__dirname, 'main.ts'), 'utf-8');
const output = babel.transformSync(inputCode, {
  filename: 'main.ts',
  plugins: [BabelReplacerPlugin],
  parserOpts: { sourceType: 'module', plugins: ['typescript'] },
});

fs.writeFileSync('out.js', output.code);
