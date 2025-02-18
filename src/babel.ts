import { replacement } from './constants';

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
function ReplacerPlugin() {
  return {
    name: 'babel-replacer-plugin',
    visitor: {
      Program(path) {
        const importDeclarations = new Array;

        path.traverse({
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
          const lastImportIndex = path.node.body.findIndex(
            node => node.type !== 'ImportDeclaration'
          );

          const insertIndex = lastImportIndex === -1
            ? path.node.body.length
            : lastImportIndex;

          path.node.body.splice(insertIndex, 0, ...importDeclarations);
        }
      },
    },
  };
}

export { replacement, ReplacerPlugin as default };
