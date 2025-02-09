export * from './plugin.js';
export { ReplacerPlugin as default } from './plugin.js';

/**
 * A map that stores string-based replacements for `@comptime` comments in source code.
 * 
 * The keys are the identifiers found in the `@comptime` comments, and the values are the corresponding
 * code snippets to be inserted at the matching locations in the source files during the build process.
 * 
 * Example:
 * 
 * replacement.set('someFunction', 'import { someFunction } from "some-module";');
 * 
 * This map is used by the `ReplacerPlugin` to dynamically insert code based on specific comments
 * found in the source files.
 */
export const replacement: Map<string, string> = new Map();