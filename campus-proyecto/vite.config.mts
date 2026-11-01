import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:'./',plugins:[react()],build:{outDir:'../campus',emptyOutDir:true,rollupOptions:{input:{index:fileURLToPath(new URL('./index.html',import.meta.url)),validar:fileURLToPath(new URL('./validar.html',import.meta.url)),admin:fileURLToPath(new URL('./admin.html',import.meta.url))}}}});
