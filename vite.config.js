import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // following option makes built index.html use relative paths instead of absolute to link .js and .css resources.
  // it's required for GitHub Pages.
  base: ''
})
