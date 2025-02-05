import fs from 'fs';
import parser from '@babel/parser';
import _traverse from '@babel/traverse';

/** @type {typeof _traverse} */
const traverse = _traverse.default;
import _generate from '@babel/generator';

import { cache } from './index.js';
/** @type {typeof _generate} */
const generate = _generate.default;

export function ReplacerPlugin() {
	/**
     * @type {import('esbuild').Plugin}
     */
	const plugin = {
		name: "ReplacerPlugin",
		setup(build) {
			build.onLoad({ filter: /\.*\.js$/ }, async (args) => {
				let code = await fs.promises.readFile(args.path, 'utf8');
				const ast = parser.parse(code, {
					sourceType: 'module'
				});

				const importDeclarations = [];

				traverse(ast, {
					enter(path) {
						if (path.node.leadingComments) {
							path.node.leadingComments.forEach((comment) => {
								if (comment.value.includes('@comptime')) {
									const [, match] = comment.value.match(/@comptime (\w+)/);
									if (match && cache.has(match)) {
										const insertedCode = cache.get(match);
										const insertedAst = parser.parse(insertedCode, { sourceType: 'module' });

										insertedAst.program.body.forEach(node => {
											if (node.type === 'ImportDeclaration') {
												importDeclarations.push(node);
											} else {
												path.insertBefore(node);
											}
										});

										cache.delete(match);
									}
								}
							});
						}
					},
				});

				if (importDeclarations.length > 0) {
					const existingImports = ast.program.body.filter(
						node => node.type === 'ImportDeclaration'
					);
					const lastImportIndex = existingImports.length;

					importDeclarations.forEach(importNode => {
						ast.program.body.splice(lastImportIndex, 0, importNode);
					});
				}

				const transformedCode = generate(ast).code;
				return { contents: transformedCode, loader: 'js' };
			})
		}
	}
	return plugin;
}