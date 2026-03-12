import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Strip spaces & special chars from asset filenames so URLs are valid
        assetFileNames: (assetInfo) => {
          const name  = assetInfo.name ?? '';
          const dot   = name.lastIndexOf('.');
          const base  = dot > -1 ? name.slice(0, dot) : name;
          const ext   = dot > -1 ? name.slice(dot)    : '';
          const safe  = base
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          return `assets/${safe}-[hash]${ext}`;
        },
      },
    },
  },
})
