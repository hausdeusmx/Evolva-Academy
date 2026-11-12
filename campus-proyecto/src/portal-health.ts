// Public availability only; private student responses never enter this cache.
const entries=new Map<string,{value?:any;expires:number;pending?:Promise<any>}>();
export async function portalHealth(endpoint:string,force=false):Promise<any>{
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('La administración todavía debe configurar la conexión del campus.');
 const entry=entries.get(endpoint);if(entry?.pending)return entry.pending;
 if(!force&&entry?.value&&entry.expires>Date.now())return entry.value;
 const next:{value?:any;expires:number;pending?:Promise<any>}={expires:0};
 next.pending=(async()=>{let response:Response;try{response=await fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'health'}),signal:AbortSignal.timeout(25000)});}catch{throw Error('No se pudo conectar con el campus. Revisa tu conexión y vuelve a intentar.');}const d=await response.json();if(!d.ok)throw Error(d.error||'No se pudo comprobar la disponibilidad.');next.value=d;next.expires=Date.now()+60000;return d;})().finally(()=>{next.pending=undefined;if(!next.value)entries.delete(endpoint);});
 entries.set(endpoint,next);return next.pending;
}
