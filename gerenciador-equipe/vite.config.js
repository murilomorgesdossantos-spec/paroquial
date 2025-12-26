import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Removemos o 'build: { outDir: ... }' para ele voltar ao padrão (pasta dist)
})