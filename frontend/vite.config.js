import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      global: 'globalThis',
    },

    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
        '@components': resolve(import.meta.dirname, 'src/components'),
        '@pages': resolve(import.meta.dirname, 'src/pages'),
        '@services': resolve(import.meta.dirname, 'src/services'),
        '@hooks': resolve(import.meta.dirname, 'src/hooks'),
        '@contexts': resolve(import.meta.dirname, 'src/contexts'),
        '@utils': resolve(import.meta.dirname, 'src/utils'),
        '@config': resolve(import.meta.dirname, 'src/config'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            const chunkGroups = {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'ui-vendor': ['framer-motion', 'recharts'],
              'three-vendor': ['three'],
              'utils-vendor': ['axios', 'xlsx'],
            };

            for (const [chunkName, packages] of Object.entries(chunkGroups)) {
              if (
                packages.some((pkg) =>
                  id.includes(`/node_modules/${pkg}/`)
                )
              ) {
                return chunkName;
              }
            }

            return undefined;
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },

    preview: {
      port: 3000,
    },
  };
});
