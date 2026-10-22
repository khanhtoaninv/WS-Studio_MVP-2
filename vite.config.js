import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// npm run build → dist/ws-studio.html: một tệp tự đủ, mở bằng file:// (đặc tả T1).
export default defineConfig({
  plugins: [viteSingleFile()],
  build: { outDir: 'dist', assetsInlineLimit: 100_000_000, rollupOptions: { input: 'ws-studio.html' } },
});
