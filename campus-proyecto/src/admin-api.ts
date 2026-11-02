import {academicActions,academicDemo} from './academic-demo';
import {demoLearners,demoAcademic,demoRevision,demoRecords,saveDemoRecords} from './demo-academics';
const endpoint=String(window.EVOLVA_CONFIG?.API_URL||'').trim();
export const adminDemo=!endpoint&&window.EVOLVA_CONFIG?.DEMO_MODE===true;
const tokenKey='evolva-admin:'+endpoint+':session';
let token=sessionStorage.getItem(tokenKey)||'';
function failure(message:string,status=400){return Object.assign(Error(message),{status});}
function requireDemo(){if(token!=='demo-admin')throw failure('Inicia sesión en administración.',401);}
function details(folio:string){const student=demoLearners().find(s=>s.folio===folio);if(!student)throw failure('Alumno no encontrado.',404);const d=demoAcademic(student);return {ok:true,student,grades:d.grades.map(g=>({...g,revision:demoRevision(g)})),exams:d.exams,average:d.average,progress:d.progress};}
function recipients(b:any){let list=demoLearners();if(b.scope==='student')list=list.filter(s=>s.folio===b.folio);else if(['course','group'].includes(b.scope))list=list.filter(s=>s.course===b.course&&(b.scope!=='group'||s.group===b.group));else throw failure('Selecciona los destinatarios.');if(!list.length)throw failure('No hay alumnos en esa selección.');return list;}
async function remote(action:string,body:any){
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw failure('La administración de alumnos reales requiere activar la conexión con Google Sheets.');
 let response:Response;try{response=await fetch(endpoint,{method:'POST',credentials:'omit',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...body,action,session:token}),signal:AbortSignal.timeout(['admin_publish_task','admin_push_publish'].includes(action)?90000:45000)});}catch{throw failure('No se pudo conectar. Actualiza los datos antes de volver a guardar.');}
 let data:any;try{data=await response.json();}catch{throw failure('El servidor no devolvió una respuesta válida.');}
 if(!data.ok){if(data.status===401){token='';sessionStorage.removeItem(tokenKey);}throw failure(data.error||'No se pudo completar la solicitud.',data.status||400);}return data;
}
export async function adminAPI(action:string,b:any={}):Promise<any>{
 if(action==='status'){if(!token)return {authenticated:false,demo:adminDemo};try{const data=await adminAPI('admin_session');return {authenticated:true,demo:adminDemo,admin:data.admin};}catch(e:any){if(e.status===401)return {authenticated:false,demo:adminDemo};throw e;}}
 if(action==='demo_login'){if(!adminDemo)throw failure('La cuenta de prueba está desactivada.');token='demo-admin';sessionStorage.setItem(tokenKey,token);return {ok:true,admin:{name:'Administración de prueba',email:'admin@demo.evolva.test'}};}
 if(action==='logout'){try{if(!adminDemo&&token)await remote('logout',{});}finally{token='';sessionStorage.removeItem(tokenKey);}return {ok:true};}
 if(!adminDemo){const data=await remote(action,b);if(action==='admin_login'){token=data.session;sessionStorage.setItem(tokenKey,token);}return data;}
 if(action==='admin_login')throw failure('Las cuentas reales aún requieren activación. Usa la administración de prueba para revisar el panel.');
 requireDemo();
 if(academicActions.includes(action))return academicDemo('admin',action,b);
 if(action==='admin_session')return {ok:true,admin:{name:'Administración de prueba',email:'admin@demo.evolva.test'}};
 if(action==='admin_students'){const q=String(b.query||'').toLowerCase(),students=demoLearners().filter(s=>[s.folio,s.name,s.course,s.email,s.group].some(v=>v.toLowerCase().includes(q)));return {ok:true,students,total:students.length,courses:['Finanzas Personales'],groups:[{course:'Finanzas Personales',group:'FIN-01'}]};}
 if(action==='admin_student')return details(b.folio);
 if(action==='admin_save_grade'){
  const d=details(b.folio),old=d.grades.find((g:any)=>g.id===b.id),score=b.score===''||b.score===null?null:Number(b.score);
  if(!b.title?.trim()||!b.module?.trim()||(score!==null&&(!Number.isFinite(score)||score<0||score>10)))throw failure('Revisa la evaluación y la calificación de 0 a 10.');
  if(old&&b.revision!==old.revision)throw failure('La evaluación cambió. Actualiza antes de guardar.',409);
  const records=demoRecords();records[b.folio]??={attempts:{},payments:[],read:[]};records[b.folio].gradeOverrides??={};records[b.folio].gradeOverrides[b.id]={id:b.id,module:b.module,title:b.title,score,status:b.status||(score===null?'Pendiente':'Calificado')};saveDemoRecords(records);return details(b.folio);
 }
 if(action==='admin_exam_preview'){const list=recipients(b);return {ok:true,count:list.length,fingerprint:list.map(s=>s.folio).sort().join('|')};}
 if(action==='admin_publish_exam'){
  const list=recipients(b);if(b.fingerprint!==list.map(s=>s.folio).sort().join('|'))throw failure('Revisa los destinatarios otra vez.',409);
  if(!b.title?.trim()||!b.module?.trim()||!/^https:\/\//.test(b.url))throw failure('Revisa los datos del examen.');
  const records=demoRecords();let created=0;
  for(const student of list){const id='EX-'+b.requestId+'-'+student.folio;records[student.folio]??={attempts:{},payments:[],read:[]};const record=records[student.folio];record.assignedExams??=[];record.gradeOverrides??={};if(!record.assignedExams.some((e:any)=>e.id===id)){record.assignedExams.push({id,module:b.module,title:b.title,url:b.url,duration:Number(b.duration)||10});created++;}record.gradeOverrides[id]??={id,module:b.module,title:b.title,score:null,status:'Pendiente'};}
  saveDemoRecords(records);return {ok:true,count:list.length,created};
 }
 throw failure('Acción no disponible en este entorno.');
}
