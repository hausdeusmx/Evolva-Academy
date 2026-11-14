export type AccessScope37='company'|'waitlist';
export type AccessDriver37=(action:string,body:Record<string,any>)=>Promise<any>;
const allowed:Record<AccessScope37,string[]>={company:['dashboard','invite'],waitlist:['status','cancel']};
export function createAccess37(scope:AccessScope37,endpoint:string,fetcher:typeof fetch=fetch,driver?:AccessDriver37){
 let token='',expires=0,epoch=0;
 const clear=()=>{token='';expires=0;epoch++;};
 async function send(action:string,body:Record<string,any>={}){if(driver)return driver(action,body);if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('Administración debe configurar este servicio.');const r=await fetcher(endpoint,{method:'POST',credentials:'omit',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...body,action}),signal:AbortSignal.timeout(25000)});let d:any;try{d=await r.json();}catch{throw Error('El servicio no devolvió una respuesta válida.');}if(!d.ok)throw Object.assign(Error(d.error||'No se pudo completar la solicitud.'),{status:d.status||400});return d;}
 async function config(){const start=epoch;const r=await send('v37_public_config');if(start!==epoch)throw Error('La consulta cambió. Intenta de nuevo.');return r;}
 async function requestCode(body:Record<string,any>){const email=String(body.email||'').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw Error('Revisa el correo electrónico.');return send('v37_'+scope+'_code',{...body,email});}
 async function verify(challenge:string,code:string){const start=epoch;const r=await send('v37_'+scope+'_verify',{challenge,code});if(start!==epoch)throw Error('La consulta cambió. Verifica nuevamente.');if(!/^[a-f0-9]{64}$/i.test(String(r.accessToken||''))||!Number.isFinite(Date.parse(r.expiresAt))||Date.parse(r.expiresAt)<=Date.now())throw Error('No se pudo verificar el acceso. Solicita otro código.');token=r.accessToken;expires=Date.parse(r.expiresAt);return {expiresAt:r.expiresAt};}
 async function call(action:string,body:Record<string,any>={}){if(!allowed[scope].includes(action))throw Error('Operación no disponible para este acceso.');if(!token||expires<=Date.now()){clear();throw Object.assign(Error('El acceso terminó. Verifica tu correo.'),{status:401});}const start=epoch;try{const r=await send('v37_'+scope+'_'+action,{...body,accessToken:token});if(start!==epoch)throw Error('El acceso cambió. Verifica nuevamente.');return r;}catch(e:any){if(start===epoch&&e.status===401)clear();throw e;}}
 async function logout(){const previous=token;clear();if(previous)await send('v37_'+scope+'_logout',{accessToken:previous});}
 async function demoAccess(){if(!driver)throw Error('La demostración está desactivada.');const r=await driver('v37_demo_'+scope,{});return verify(r.challenge,r.code);}
 return {config,requestCode,verify,call,logout,clear,demoAccess};
}
