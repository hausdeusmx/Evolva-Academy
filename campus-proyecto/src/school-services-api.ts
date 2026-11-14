export type SchoolDocument={id:string;kind:string;title:string;available:boolean;status:string;description:string;date?:string};
export type SchoolCatalog={student:{name:string;matricula:string;course:string;group:string};courses:{record:string;name:string;group:string}[];record:string;documents:SchoolDocument[];expiresAt:string};
export function normalizedSchoolCurp(value:string){return value.trim().toUpperCase();}
export function validSchoolCurp(value:string){return /^[A-Z0-9]{18}$/.test(normalizedSchoolCurp(value));}
export function createSchoolServicesAPI(endpoint:string,request:typeof fetch=fetch){
 let token='',epoch=0;
 async function call(action:string,body:Record<string,unknown>={}){
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('La consulta se está habilitando. Puedes ingresar a tu campus.');
  const current=epoch;let response:Response;try{response=await request(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...body,action,schoolToken:token}),signal:AbortSignal.timeout(45000)});}catch{throw Error('No pudimos conectar. Revisa tu conexión e intenta nuevamente.');}
  let data;try{data=await response.json();}catch{throw Error('No recibimos una respuesta válida. Intenta nuevamente.');}
  if(current!==epoch)throw Object.assign(Error('La consulta cambió. Intenta nuevamente.'),{status:409});
  if(!data.ok)throw Object.assign(Error(data.error||'No se pudo completar la consulta.'),{status:data.status||400});
  return data;
 }
 return {
  health:()=>call('health'),
  requestCode:(curp:string,turnstileToken:string)=>{if(!validSchoolCurp(curp))return Promise.reject(Error('Escribe los 18 caracteres de tu CURP.'));if(!turnstileToken)return Promise.reject(Error('Completa la verificación de seguridad.'));return call('v32_school_code',{curp:normalizedSchoolCurp(curp),turnstileToken});},
  verify:async(challenge:string,code:string)=>{const d=await call('v32_school_verify',{challenge,code});if(!/^[a-f0-9]{64}$/i.test(d.schoolToken)||!(Date.parse(d.expiresAt)>Date.now()))throw Error('No se pudo verificar el acceso. Solicita un código nuevo.');token=d.schoolToken;return d;},
  catalog:async(record=''):Promise<SchoolCatalog>=>call('v32_school_documents',record?{record}:{}),
  file:(record:string,id:string)=>call('v32_school_file',{record,id}),
  logout:async()=>{try{if(token)await call('v32_school_logout');}finally{token='';epoch++;}},
  clear:()=>{token='';epoch++;}
 };
}
