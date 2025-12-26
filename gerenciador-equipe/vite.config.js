import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Isso diz: "Construa os arquivos e jogue eles na pasta public da raiz"
    outDir: '../www',
    emptyOutDir: true, // Limpa a pasta antes de criar novos arquivos
  }
})