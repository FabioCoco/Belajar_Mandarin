import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' membuat semua aset memakai path relatif, jadi hasil build bisa dipasang di mana saja:
// root domain (Vercel), sub-path GitHub Pages (/nama-repo/), atau server statis biasa.
// Navigasi memakai hash (#/kuis), sehingga tidak butuh aturan rewrite di server.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Pisahkan React agar tetap ter-cache saat kode aplikasi berubah
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
});
