# ReplacerPlugin

The `ReplacerPlugin` is an ESBuild plugin that scans JavaScript/TypeScript files for `@comptime` comments, replacing them with code from a predefined `replacement` map. It ensures correct import placement and preserves the file structure using Babel's AST manipulation.

## Usage

Add the `ReplacerPlugin` to your ESBuild configuration:

```javascript
import esbuild from 'esbuild';
import { ReplacerPlugin } from '@meta-oh/replacer';

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  plugins: [ReplacerPlugin()],
}).catch(() => process.exit(1));
```

## How it Works

- The plugin scans for `@comptime` comments in the code.
- When found, it looks up the matching code from the `replacement` map and inserts it into the file.
- Any new import declarations are inserted in the correct place, ensuring no disruption to existing imports.
- Babel's AST tools are used for precise code manipulation.

## Example

Given the following code:

```javascript
// @comptime someFunction
const x = 10;
```

If `someFunction` is mapped in the `replacement` map, it will be replaced with the corresponding code during the build.

## Configuration

The plugin uses a `replacement` map, which should be defined as follows:

```javascript
import { replacement } from '@meta-oh/replacer';

replacement.set('VAR', 'const myVar = 5');
```