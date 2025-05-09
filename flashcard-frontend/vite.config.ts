import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    build: {
        outDir: './static',
        emptyOutDir: true,
        sourcemap: true,
    },

    // Configure the server to proxy API requests to the Flask backend
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
            }
        }
    },
})
