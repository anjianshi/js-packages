import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const base = path.dirname(fileURLToPath(new URL(import.meta.url)))
const src = path.join(base, 'src')

export default defineConfig(({ mode }) => {
  const inDev = mode === 'development'
  const appConfig = {
    inDev,
  }

  return {
    mode,
    root: src,
    base: '',
    publicDir: path.join(base, 'public'),

    define: {
      'window.APP_CONFIG': JSON.stringify(appConfig),
    },

    resolve: {
      alias: {
        '@': src,
      },
    },

    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [['@swc/plugin-emotion', {}]],
      }),
      svgr(),
    ],

    server: {
      host: true,
      port: 3000,
      strictPort: true,
    },

    build: {
      outDir: path.join(base, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.join(src, 'index.html'),
      },
    },
  }
})
