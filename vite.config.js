import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/my-vite-test/',   // 👈 вот эта строка важна для GitHub Pages
})
