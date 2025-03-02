import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      Components: path.resolve(__dirname, 'src/Components'),
      Assets: path.resolve(__dirname, 'src/Assets'),
      Contexts: path.resolve(__dirname, 'src/Contexts'),
      Utilities: path.resolve(__dirname, 'src/Utilities'),
      Styles: path.resolve(__dirname, 'src/Styles'),
      Svgs: path.resolve(__dirname, 'src/Assets/Svgs'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
