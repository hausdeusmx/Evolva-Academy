import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// Open tabs still import their original hashed chunks after a new deployment.
// Retain public JS/CSS for the last 16 builds (up to 30 days / 64 MiB).
// Never retain config, HTML, uploads, sessions, or arbitrary public directories.
const assetName=/^[A-Za-z0-9_-]+-[A-Za-z0-9_-]{8}\.(?:js|css)$/;
const MAX_FILE=5*1024*1024,MAX_TOTAL=64*1024*1024;
function activeAssets(text){try{const d=JSON.parse(text);if(d.schema===1&&Array.isArray(d.assets))return new Set(d.assets.filter(n=>typeof n==='string'&&assetName.test(n)));}catch{}return null;}
export function writeBuildManifest(outputDirectory){
 const dir=path.join(outputDirectory,'assets'),assets=fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.isFile()&&assetName.test(e.name)).map(e=>e.name).sort(),version=createHash('sha256').update(assets.join('\n')).digest('hex').slice(0,12);
 fs.writeFileSync(path.join(outputDirectory,'build-assets.json'),JSON.stringify({schema:1,version,assets})+'\n');
 for(const entry of fs.readdirSync(outputDirectory,{withFileTypes:true})){if(!entry.isFile()||!entry.name.endsWith('.html'))continue;const file=path.join(outputDirectory,entry.name),html=fs.readFileSync(file,'utf8').replace(/<meta name="evolva-build" content="[a-f0-9]{12}">/g,'');fs.writeFileSync(file,html.replace('</head>','<meta name="evolva-build" content="'+version+'"></head>'));}
}
export function collectBuildAssets(repoRoot,outputDirectory,{limit=16}={}){
 const retained=new Map();let total=0;
 const add=(name,bytes)=>{if(!assetName.test(name)||retained.has(name)||bytes.length>MAX_FILE||total+bytes.length>MAX_TOTAL)return;retained.set(name,bytes);total+=bytes.length;};
 const current=path.join(outputDirectory,'assets'),manifest=path.join(outputDirectory,'build-assets.json'),active=fs.existsSync(manifest)?activeAssets(fs.readFileSync(manifest,'utf8')):null;
 if(fs.existsSync(current))for(const entry of fs.readdirSync(current,{withFileTypes:true})){if(!entry.isFile()||!assetName.test(entry.name)||(active&&!active.has(entry.name)))continue;const filename=path.join(current,entry.name);if(fs.statSync(filename).size<=MAX_FILE)add(entry.name,fs.readFileSync(filename));}
 const git=args=>spawnSync('git',args,{cwd:repoRoot,encoding:'utf8',maxBuffer:8*1024*1024});
 const history=git(['log','--format=%H','--max-count='+limit,'--since=30.days','--','campus/assets']);
 if(history.status!==0)return retained;
 for(const commit of history.stdout.trim().split('\n').filter(x=>/^[a-f0-9]{40}$/.test(x))){
  const recorded=git(['show',commit+':campus/build-assets.json']),generated=recorded.status===0?activeAssets(recorded.stdout):null;
  const tree=git(['ls-tree','-rl',commit,'--','campus/assets']);if(tree.status!==0)continue;
  for(const row of tree.stdout.split('\n')){
   const match=row.match(/^100644 blob ([a-f0-9]{40})\s+(\d+)\tcampus\/assets\/([^/]+)$/);if(!match)continue;
   const [,blob,size,name]=match;if(!assetName.test(name)||(generated&&!generated.has(name))||retained.has(name)||Number(size)>MAX_FILE||total+Number(size)>MAX_TOTAL)continue;
   const result=spawnSync('git',['cat-file','blob',blob],{cwd:repoRoot,maxBuffer:MAX_FILE+1024});if(result.status===0)add(name,result.stdout);
  }
 }
 return retained;
}
export function restoreBuildAssets(outputDirectory,retained){
 const directory=path.join(outputDirectory,'assets');fs.mkdirSync(directory,{recursive:true});let restored=0;
 for(const [name,bytes]of retained){if(!assetName.test(name)||bytes.length>MAX_FILE)continue;const target=path.join(directory,name);if(!fs.existsSync(target)){fs.writeFileSync(target,bytes,{flag:'wx'});restored++;}}
 return restored;
}
