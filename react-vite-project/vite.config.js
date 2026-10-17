import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
    },
    server: {
        port: 3000, // Specify the development server port
        proxy: {
            "/user": "http://localhost:8080" // TODO change path to API
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.js',
    },
});