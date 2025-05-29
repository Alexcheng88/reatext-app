// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactComponentTagger } from 'react-component-tagger';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    reactComponentTagger()
  ],
  // 只让 Vite 扫描根目录下的 index.html，忽略 android/... 下的其它文件
  optimizeDeps: {
    entries: ['./index.html']
  },
  build: {
    chunkSizeWarningLimit: 10240,
  },
});
