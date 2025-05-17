import { sveltekit } from '@sveltejs/kit/vite'
import ssl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit(), ssl()],

  server: {
    watch: {
      ignored: ['**/.jj/**'],
    },
  },
})
