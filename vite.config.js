import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' agar build bisa dipasang di Vercel maupun sub-path GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
});
