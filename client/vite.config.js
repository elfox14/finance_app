import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/fin/', // هذا السطر ضروري جداً لأنك ترفع على mcprim.com/fin
})
