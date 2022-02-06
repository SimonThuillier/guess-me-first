/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
})*/

import { defineConfig } from "vite"
import react from "vite-preset-react"

export default defineConfig({
  plugins: [react()]
})
