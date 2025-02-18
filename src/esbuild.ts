import fs from 'fs';
import parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { replacement } from './constants';
import { Plugin } from 'esbuild';

const traverse = typeof _traverse == 'object'
	? (_traverse as any).default
	: _traverse;

const generate = typeof _generate == 'object'
	? (_generate as any).default
	: _generate;

/**
 * ESBuild plugin that replaces `@comptime` comments in JavaScript/TypeScript files with code 
 * from a predefined `replacement` map.
 * 
 * The plugin scans the source code for comments containing `@comptime`, and when a match is found,
 * it inserts the corresponding code from the `replacement` map into the file. The plugin also ensures 
 * that import statements are correctly ordered, placing new imports at the appropriate position 
 * without disrupting existing ones.
 * 
 * It uses Babel's AST manipulation tools (`@babel/parser`, `@babel/traverse`, `@babel/generator`) 
 * for precise code transformation during the build process.
 */
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
										const statements = replacement.get(match)!;

										statements.forEach(node => {
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

export { replacement, ReplacerPlugin as default }