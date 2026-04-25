import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  base: '/fin/', // هذا السطر هو الذي سيحل مشكلة الشاشة البيضاء
})
