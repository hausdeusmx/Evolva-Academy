export const isTeacherExperience=/\/docentes(?:\.html|\/|\/index\.html)$/.test(location.pathname);
const endpoint=String(window.EVOLVA_CONFIG?.API_URL||'').trim(),key='evolva-teacher:'+endpoint;
let token=sessionStorage.getItem(key)||'';
export async function teacherRequest(action:string,body:any={}):Promise<any>{
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('El acceso docente requiere conectar el servidor del campus.');
 const response=await fetch(endpoint,{method:'POST',credentials:'omit',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...body,action,session:token}),signal:AbortSignal.timeout(90000)});let data:any;try{data=await response.json();}catch{throw Error('El servidor no devolvió una respuesta válida.');}
 if(!data.ok){if(data.status===401){token='';sessionStorage.removeItem(key);}throw Object.assign(Error(data.error||'No se pudo completar la operación.'),{status:data.status});}return data;
}
export async function teacherAPI(action:string,body:any={}):Promise<any>{
 if(action==='status'){if(!token)return {authenticated:false};try{const r=await teacherRequest('v19_teacher_session');return {authenticated:true,admin:r.teacher};}catch(e:any){if(e.status===401)return {authenticated:false};throw e;}}
 if(action==='admin_login'){const r=await teacherRequest('v19_teacher_login',body);token=r.session;sessionStorage.setItem(key,token);return {ok:true,admin:r.teacher};}
 if(action==='logout'){try{return await teacherRequest('logout');}finally{token='';sessionStorage.removeItem(key);}}
 if(action.startsWith('v19_'))return teacherRequest(action,body);
 return teacherRequest('v19_teacher_proxy',{operation:action,params:body});
}
