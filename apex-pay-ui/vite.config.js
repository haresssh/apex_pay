import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This exposes the server to the Docker network
    port: 5173,
    watch: {
      usePolling: true, // Required for Docker hot-reloading on some OS architectures
    }
  },
})
