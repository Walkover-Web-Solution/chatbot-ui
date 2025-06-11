import { defineConfig } from 'tsup'

export default defineConfig({
    // Entry points - specify your main files
    entry: ['src/index.tsx'],

    // Output formats
    format: ['esm'],

    // Generate TypeScript declaration files
    dts: {
        resolve: true
    },

    // Clean output directory before build
    clean: true,

    // Split chunks for better tree shaking
    splitting: true,

    // Generate sourcemap
    // sourcemap: true,

    // Minify output
    minify: false,

    // External dependencies (don't bundle these)
    external: ['react', 'react-dom', 'next'],

    // Target environment
    target: 'es2020',
    define: {
        'process.env.NEXT_PUBLIC_API_BASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_BASE_URL || 'https://db.gtwy.ai'),
        'process.env.NEXT_PUBLIC_API_ENVIRONMENT': JSON.stringify(process.env.NEXT_PUBLIC_API_ENVIRONMENT || 'PROD'),
        'process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL || 'https://api.gtwy.ai'),
        'process.env.NEXT_PUBLIC_FRONTEND_URL': JSON.stringify(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://gtwy.ai'),
        'process.env.NEXT_PUBLIC_CHATBOT_FEEDBACK_URL': JSON.stringify(process.env.NEXT_PUBLIC_CHATBOT_FEEDBACK_URL || 'https://dev.sokt.io/func/scriW07Woc4M'),
        'process.env.NODE_VERSION': JSON.stringify(process.env.NODE_VERSION || '20.18.3s'),
        'process.env.NEXT_PUBLIC_MSG91_HOST_URL': JSON.stringify(process.env.NEXT_PUBLIC_MSG91_HOST_URL || 'https://api.phone91.com'),
        'process.env.NEXT_PUBLIC_SOCKET_URL': JSON.stringify(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://chat.phone91.com'),
        'process.env.NEXT_PUBLIC_NOTIFICATOIN_SOCKET_URL': JSON.stringify(process.env.NEXT_PUBLIC_NOTIFICATOIN_SOCKET_URL || 'https://notifications.phone91.com'),
    },

    // Path alias resolution and asset loader support
    esbuildOptions(options) {
        options.loader = {
            '.ts': 'ts',
            '.css': 'css',
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
        options.jsx = 'automatic'
        options.alias = {
            '@': './',
        };
    }
});