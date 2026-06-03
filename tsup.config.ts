import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['react', 'react-dom', 'date-fns'],
  injectStyle: false,
  loader: { '.css': 'copy' },
  publicDir: false,
  async onSuccess() {
    const { cp } = await import('node:fs/promises');
    await cp('src/styles.css', 'dist/styles.css');
  },
});
