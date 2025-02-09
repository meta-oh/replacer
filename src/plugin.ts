import fs from 'fs';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { replacement } from './index.js';
import { Plugin } from 'esbuild';

export function ReplacerPlugin(): Plugin {
	const plugin: Plugin = {
		name: "ReplacerPlugin",
		setup(build) {
			build.onLoad({ filter: /\.*\.(j|t)sx?$/ }, async (args) => {
				let code = await fs.promises.readFile(args.path, 'utf8');
				const ast = parser.parse(code, {
					sourceType: 'module'
				});

				const importDeclarations = new Array;

				traverse(ast, {
					enter(path) {
						if (path.node.leadingComments) {
							path.node.leadingComments.forEach((comment) => {
								if (comment.value.includes('@comptime')) {
									const [, match] = comment.value.match(/@comptime (\w+)/) ?? [];

									if (match && replacement.has(match)) {
										const insertedCode = replacement.get(match)!;
										const insertedAst = parser.parse(insertedCode, { sourceType: 'module' });

										insertedAst.program.body.forEach(node => {
											if (node.type === 'ImportDeclaration') {
												importDeclarations.push(node);
											} else {
												path.insertBefore(node);
											}
										});

										replacement.delete(match);
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