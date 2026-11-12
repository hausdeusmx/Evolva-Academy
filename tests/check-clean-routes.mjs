import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import vm from 'node:vm';import {routes,mapping,cleanHref} from '../scripts/clean-routes.mjs';
const script=fs.readFileSync('assets/clean-routes.js','utf8');
for(const pathname of Object.keys(mapping)){
 let updated,storageReads=0,base;
 const context={location:{protocol:'https:',hostname:'evolvacademy.mx',origin:'https://evolvacademy.mx',pathname,search:'?codigo=EVC-SYNTHETIC&seccion=pagos',hash:'#recuperar=synthetic'},history:{replaceState:(_a,_b,url)=>updated=url},document:{readyState:'loading',createElement:()=>({}),head:{prepend:b=>base=b.href},addEventListener(){}},localStorage:{getItem(){storageReads++;}},sessionStorage:{getItem(){storageReads++;}}};
 vm.runInNewContext(script,context);assert.equal(updated,mapping[pathname]+context.location.search+context.location.hash);assert.equal(base,pathname.startsWith('/campus/')?'/campus/':'/');assert.equal(storageReads,0);
 assert.equal(cleanHref('https://external.example.test/'+pathname,'https://evolvacademy.mx/'), 'https://external.example.test/'+pathname);
}
for(const [protocol,hostname] of [['file:',''],['https:','appassets.androidplatform.net']]){let touched=false;vm.runInNewContext(script,{location:{protocol,hostname},document:{createElement(){touched=true;}}});assert.equal(touched,false,'Keep bundled Android paths unchanged');}
assert.equal(cleanHref('../privacidad.html','https://evolvacademy.mx/campus/'),'/privacidad/');assert.equal(cleanHref('./admin.html?grupo=FIN#alumnos','https://evolvacademy.mx/campus/'),'/campus/admin/?grupo=FIN#alumnos');
if(process.argv.includes('--built'))for(const [url,file]of [...routes.public.map(n=>['/'+n+'/',n+'/index.html']),...routes.campus.map(n=>['/campus/'+n+'/','campus/'+n+'/index.html'])]){
 const html=fs.readFileSync(file,'utf8');assert.ok(html.includes('clean-routes.js'),file);assert.ok(html.includes('https://evolvacademy.mx'+url),file);
 for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){const u=new URL(match[1],'https://evolvacademy.mx'+url);if(u.origin!=='https://evolvacademy.mx')continue;const target=decodeURIComponent(u.pathname.slice(1));if(!target)continue;assert.ok(fs.existsSync(target),file+' → '+target);}
}
console.log('Clean routes passed: public/campus directory URLs, old links, query/hash and recovery-token preservation, stable asset base, unchanged native bundle paths and zero credential access.'+(process.argv.includes('--built')?' Generated pages and local assets verified.':''));
