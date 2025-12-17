import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development')
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 10000,
    strictPort: true,
    allowedHosts: [
      'recruitment-platform-faa8.onrender.com',
      'localhost',
      '127.0.0.1'
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'recruitment-platform-faa8.onrender.com',
      'localhost',
      '127.0.0.1'
    ],
  }
}))
