import { defineConfig } from 'tsup'

export default defineConfig({
    // Entry points - specify your main files
    entry: ['app/'],

    // Output formats
    format: ['cjs'],

    // Generate TypeScript declaration files
    dts: true,

    // Clean output directory before build
    clean: true,

    // Split chunks for better tree shaking
    splitting: false,

    // Generate sourcemap
    sourcemap: true,

    // Minify output
    minify: false,

    // External dependencies (don't bundle these)
    external: ['react', 'react-dom', 'next'],

    // Target environment
    target: 'es2020',

    // Path alias resolution and asset loader support
    esbuildOptions(options) {
        options.loader = {
            '.ts': 'ts',
            '.tsx': 'tsx',
            '.js': 'jsx',
            '.mjs': 'jsx',
            '.json': 'json',
            '.png': 'file',
            '.gif': 'file',
            '.svg': 'file',
            '.ico': 'file',    // Added support for .ico files
            '.scss': 'css',    // Added support for .scss files
        };
        options.alias = {
            '@': './',
        };
    }
});