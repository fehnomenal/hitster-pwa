import { sveltekit } from '@sveltejs/kit/vite'
import unocss from '@unocss/svelte-scoped/vite'
import ssl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    unocss({
      classPrefix: 'u-',
      injectReset: '@unocss/reset/tailwind.css',
    }),
    sveltekit(),
    ssl(),
  ],

  server: {
    watch: {
      ignored: ['**/.jj/**'],
    },
  },
})
