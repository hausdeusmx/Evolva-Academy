// Android 1.1 uses an origin-checked WebMessage listener and Android Keystore.
// The browser fallback is only used by the installed web app / original APK.
declare global {interface Window {EvolvaSession?:{postMessage:(data:string)=>void;onmessage:((event:{data:string})=>void)|null}}}
const pending=new Map<string,{resolve:(value:string)=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
function nativeRequest(action:string,value=''):Promise<string>{
 const bridge=window.EvolvaSession;
 if(!bridge)return Promise.reject(Error('Almacenamiento de la app no disponible.'));
 bridge.onmessage=event=>{try{const reply=JSON.parse(event.data),p=pending.get(reply.id);if(!p)return;clearTimeout(p.timer);pending.delete(reply.id);reply.ok?p.resolve(reply.value||''):p.reject(Error('No se pudo guardar el acceso en este dispositivo.'));}catch{/* Ignore messages that do not match a request. */}};
 const id=crypto.randomUUID();return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(Error('No se pudo abrir el acceso guardado. Vuelve a intentar.'));},8000);pending.set(id,{resolve,reject,timer});bridge.postMessage(JSON.stringify({id,action,value}));});
}
export async function readDeviceToken(scope:string):Promise<string>{
 if(window.EvolvaSession){const raw=await nativeRequest('read');if(!raw)return '';try{const data=JSON.parse(raw);return data.scope===scope&&/^[a-f0-9]{64}$/i.test(data.token)?data.token:'';}catch{return '';}}
 try{return localStorage.getItem(scope+':device')||'';}catch{return '';}
}
export async function saveDeviceToken(scope:string,token:string):Promise<void>{
 if(window.EvolvaSession){await nativeRequest(token?'write':'clear',token?JSON.stringify({scope,token}):'');try{localStorage.removeItem(scope+':device');}catch{/* Nothing to migrate. */}return;}
 if(token)localStorage.setItem(scope+':device',token);else localStorage.removeItem(scope+':device');
}
