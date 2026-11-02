import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:'./',server:{allowedHosts:['terminal.local']},plugins:[react()],build:{outDir:'../campus',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'assets/[name]-push6-[hash].js',chunkFileNames:'assets/[name]-push6-[hash].js',assetFileNames:'assets/[name]-push6-[hash][extname]'},input:{index:fileURLToPath(new URL('./index.html',import.meta.url)),validar:fileURLToPath(new URL('./validar.html',import.meta.url)),admin:fileURLToPath(new URL('./admin.html',import.meta.url))}}}});
