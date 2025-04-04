import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [
        react()
    ],
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@common': path.resolve(__dirname, './src/common'),
            '@contexts': path.resolve(__dirname, './src/contexts'),
            '@helpers': path.resolve(__dirname, './src/helpers'),
            '@pages': path.resolve(__dirname, './src/pages'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})
