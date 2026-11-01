import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../apps-script');
const names=['PortalPages.gs','RegistroPages.gs','AdminPages.gs','ExpedienteTareas.gs'];
let output='/** EVOLVA ACADEMY V5 · ARCHIVO COMPLETO\n * Sustituye Código.gs por este contenido y retira los .gs individuales duplicados.\n * Conserva appsscript.json y las propiedades privadas del proyecto.\n * Ejecuta configurarDesdeHojaActiva y actualiza la implementación existente.\n */\n\n';
const declarations=new Set();
for(const name of names){const content=fs.readFileSync(path.join(root,name),'utf8');for(const match of content.matchAll(/\bfunction\s+([A-Za-z0-9_]+)\s*\(/g)){if(declarations.has(match[1]))throw Error('Duplicated Apps Script function: '+match[1]);declarations.add(match[1]);}output+='\n// ===== '+name+' =====\n'+content+'\n';}
new vm.Script(output,{filename:'EVOLVA-V5-COMPLETO.gs'});
fs.writeFileSync(path.join(root,'EVOLVA-V5-COMPLETO.txt'),output);
console.log('Apps Script v5 bundle verified: '+declarations.size+' unique functions.');
