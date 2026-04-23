import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'copy-manifest',
            closeBundle() {
                copyFileSync(
                    resolve(__dirname, 'manifest.json'),
                    resolve(__dirname, 'dist/manifest.json')
                );
                copyFileSync(
                    resolve(__dirname, 'xs-app.json'),
                    resolve(__dirname, 'dist/xs-app.json')
                );
            }
        }
    ],
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
    server: {
        port: 3000,
        proxy: {
            '/product': {
                target: 'http://localhost:4004',
                changeOrigin: true
            }
        }
    }
});