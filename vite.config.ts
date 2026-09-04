import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VERCEL ? '/' : (process.env.GITHUB_PAGES ? '/markdown-editor/' : './'),
  plugins: [
    tailwindcss(),
    react(),
  ],
})

