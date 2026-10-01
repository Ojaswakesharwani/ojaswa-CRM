import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// IMPORTANT: base must match your GitHub Pages repo path
// e.g. https://ojaswakesharwani.github.io/growth-os/ → base: '/growth-os/'
export default defineConfig({
  plugins: [react()],
  base: '/growth-os/',
})
