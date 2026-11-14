import {normalizedSchoolCurp,validSchoolCurp} from './school-services-api';
export function createReenrollmentAPI(endpoint:string,request:typeof fetch=fetch){
 let token='',epoch=0;
 async function call(action:string,body:Record<string,unknown>={},access=token){
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('La reinscripción se está habilitando. Puedes consultar tu campus.');
  const current=epoch;let response:Response;try{response=await request(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...body,action,reenrollmentToken:access}),signal:AbortSignal.timeout(45000)});}catch{throw Error('No pudimos conectar. Revisa tu conexión e intenta de nuevo.');}
  let data;try{data=await response.json();}catch{throw Error('No recibimos una respuesta válida. Intenta nuevamente.');}
  if(current!==epoch)throw Object.assign(Error('El acceso cambió. Verifica de nuevo.'),{status:401});
  if(!data.ok)throw Object.assign(Error(data.error||'No se pudo completar la solicitud.'),{status:data.status||400});return data;
 }
 const clear=()=>{token='';epoch++;};
 return {
  health:()=>call('health'),
  requestCode:(curp:string,turnstileToken:string)=>{if(!validSchoolCurp(curp))return Promise.reject(Error('Escribe los 18 caracteres de tu CURP.'));if(!turnstileToken)return Promise.reject(Error('Completa la verificación de seguridad.'));return call('v34_reenrollment_code',{curp:normalizedSchoolCurp(curp),turnstileToken});},
  verify:async(challenge:string,code:string)=>{const r=await call('v34_reenrollment_verify',{challenge,code});if(!/^[a-f0-9]{64}$/i.test(r.reenrollmentToken)||!(Date.parse(r.expiresAt)>Date.now()))throw Error('No se pudo confirmar el acceso. Solicita un código nuevo.');token=r.reenrollmentToken;return r;},
  studentRequest:(action:string,body:Record<string,unknown>={})=>{const actions:Record<string,string>={enrollments:'v34_reenrollment_catalog',request_enrollment:'v34_reenrollment_request',cancel_enrollment:'v34_reenrollment_cancel'};if(!actions[action])return Promise.reject(Error('Acción no disponible en reinscripción.'));return call(actions[action],body);},
  logout:async()=>{const old=token;clear();if(old)await call('v34_reenrollment_logout',{},old);},clear
 };
}
