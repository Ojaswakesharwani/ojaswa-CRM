import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match your GitHub Pages repository name: /ojaswa-CRM/
export default defineConfig({
  plugins: [react()],
  base: '/ojaswa-CRM/',
})
