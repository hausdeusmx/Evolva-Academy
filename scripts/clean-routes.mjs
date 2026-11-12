import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export const routes=JSON.parse(fs.readFileSync(path.join(root,'site-routes.json'),'utf8'));
export const mapping={...Object.fromEntries(routes.public.map(n=>['/'+n+'.html','/'+n+'/'])),...Object.fromEntries(routes.campus.map(n=>['/campus/'+n+'.html','/campus/'+n+'/'])),...routes.aliases,...routes.redirects};
for(const value of Object.values(mapping))mapping[value+'index.html']=value;
export function cleanHref(value,base){const u=new URL(value,base);if(u.origin!=='https://evolvacademy.mx')return value;const next=mapping[u.pathname];return next?next+u.search+u.hash:value;}
export function prepareRouteScript(){
 const source=`(()=>{'use strict';if(!/^https?:$/.test(location.protocol)||/^(?:appassets\\.androidplatform\\.net|localhost)$/.test(location.hostname))return;const routes=${JSON.stringify(mapping)};const next=routes[location.pathname];const base=document.createElement('base');base.href=location.pathname.startsWith('/campus/')?'/campus/':'/';document.head.prepend(base);if(next)history.replaceState(null,'',next+location.search+location.hash);function links(root){const items=root.matches?.('a[href]')?[root]:[];if(root.querySelectorAll)items.push(...root.querySelectorAll('a[href]'));for(const a of items){const raw=a.getAttribute('href');if(!raw)continue;const u=new URL(raw,document.baseURI);if(u.origin!==location.origin)continue;const target=routes[u.pathname];if(target)a.setAttribute('href',target+u.search+u.hash);else if(raw.startsWith('#'))a.setAttribute('href',location.pathname+location.search+raw);}}function ready(){links(document);new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1)links(node);}).observe(document.body,{childList:true,subtree:true});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();})();\n`;
 fs.writeFileSync(path.join(root,'assets/clean-routes.js'),source);fs.writeFileSync(path.join(root,'campus-proyecto/public/clean-routes.js'),source);
}
export function buildCleanRoutes(){
 for(const [route,target] of Object.entries(routes.redirects||{})){const out=path.join(root,route.slice(1),'index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Evolva Academy</title><meta http-equiv="refresh" content="0;url='+target+'"><link rel="canonical" href="https://evolvacademy.mx'+target+'"><script>location.replace('+JSON.stringify(target)+'+location.search+location.hash);</script></head><body><a href="'+target+'">Continuar</a></body></html>');}
 for(const [source,target] of [...routes.public.map(n=>[n+'.html',n+'/index.html']),...routes.campus.map(n=>['campus/'+n+'.html','campus/'+n+'/index.html'])]){
  let html=fs.readFileSync(path.join(root,source),'utf8');const base=new URL(source,'https://evolvacademy.mx/');
  html=html.replace(/\b(href|src)="([^"]*)"/g,(full,attr,value)=>{if(!value||/^(?:data:|blob:|mailto:|tel:|javascript:)/i.test(value))return full;const u=new URL(value,base);if(u.origin!==base.origin)return full;return attr+'="'+(mapping[u.pathname]||u.pathname)+u.search+u.hash+'"';});
  html=html.replace(/<link rel="canonical"[^>]*>/g,'').replace('</head>','<link rel="canonical" href="https://evolvacademy.mx/'+target.replace(/index\.html$/,'')+'"></head>');
  const out=path.join(root,target);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);
 }
}
if(process.argv[1]===fileURLToPath(import.meta.url)){prepareRouteScript();if(process.argv.includes('--build'))buildCleanRoutes();}
