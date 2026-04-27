import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@services': resolve(__dirname, 'src/services'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@config': resolve(__dirname, 'src/config'),
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
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', 'recharts'],
            'three-vendor': ['three'],
            'utils-vendor': ['axios', 'xlsx'],
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
