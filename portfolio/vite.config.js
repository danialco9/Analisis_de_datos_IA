import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Rutas relativas: funciona igual servido en la raiz de un dominio
  // que dentro de un subdirectorio (GitHub Pages de un repo).
  base: './',
  plugins: [react(), tailwindcss()],
})
