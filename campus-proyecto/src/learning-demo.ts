import {demoLearners,demoRecords} from './demo-academics';
import {academicAccess} from './academic-access';
export const learningActions=['lessons','lesson_file','lesson_link','lesson_studied','calendar','admin_lessons','admin_lesson_preview','admin_publish_lesson','admin_archive_lesson','admin_events','admin_event_preview','admin_publish_event','admin_cancel_event'];
const key='evolva-learning-demo-v8';
const revision=(r:any)=>JSON.stringify([r.id,r.status,r.title,r.description]);
function state(){try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(stored)return stored;}catch{}return {lessons:[{id:'CL-DEMO-1',title:'Tu primera guía de presupuesto',description:'Material de demostración. Organiza tus ingresos y gastos para comenzar tu ruta de aprendizaje.',module:'M1',week:1,order:1,scheduledAt:'2026-11-04T18:00:00.000Z',hasLink:false,attachment:null,status:'PUBLICADA',created:'2026-11-02T18:00:00.000Z',folios:['EVOLVA-000001']}],events:[],studied:{}};}
function save(s:any){localStorage.setItem(key,JSON.stringify(s));}
function audience(b:any){const list=demoLearners().filter(s=>b.scope==='student'?s.folio===b.folio:b.scope==='course'?s.course===b.course:b.scope==='group'?s.course===b.course&&s.group===b.group:false);if(!list.length)throw Error('No hay alumnos en esa selección.');return list;}
function fail(message:string,status=400):never{throw Object.assign(Error(message),{status});}
export async function learningDemo(role:'admin'|'student',action:string,b:any,student?:any){
 if(role==='student'&&!student)fail('Inicia sesión para continuar.',401);
 if(role==='student'&&action.startsWith('admin_'))fail('Acceso exclusivo para administradores.',403);
 const s=state(),who=student?.folio,blocked=academicAccess({payments:demoRecords()[who]?.payments||[]}).blocked;
 if(action==='admin_lesson_preview'||action==='admin_event_preview'){const list=audience(b);return {ok:true,count:list.length,fingerprint:list.map(x=>x.folio).sort().join('|')};}
 if(action==='admin_publish_lesson'||action==='admin_publish_event'){
  const targets=audience(b);if(targets.map(x=>x.folio).sort().join('|')!==b.fingerprint)fail('Los destinatarios cambiaron.',409);
  const isLesson=action==='admin_publish_lesson',list=isLesson?s.lessons:s.events,id=(isLesson?'CL-':'EV-')+b.requestId;
  if(list.some((x:any)=>x.id===id))return {ok:true,id,duplicate:true};
  const common={...b,id,folios:targets.map(x=>x.folio),created:new Date().toISOString(),status:isLesson?'PUBLICADA':'PUBLICADO'};
  list.push(isLesson?{...common,hasLink:!!b.url,scheduledAt:b.scheduledAt?new Date(b.scheduledAt).toISOString():'',attachment:b.file?{name:b.file.name,mime:b.file.mime,size:atob(b.file.base64).length}:null}:{...common,start:new Date(b.start).toISOString(),end:b.end?new Date(b.end).toISOString():''});save(s);return {ok:true,id,count:targets.length};
 }
 if(action==='admin_archive_lesson'||action==='admin_cancel_event'){const list=action==='admin_archive_lesson'?s.lessons:s.events,row=list.find((r:any)=>r.id===b.id);if(!row)fail('Registro no disponible.',404);if(revision(row)!==b.revision)fail('El registro cambió. Actualiza antes de continuar.',409);row.status='ARCHIVADA';save(s);return {ok:true};}
 if(action==='admin_lessons')return {ok:true,lessons:s.lessons.map(({folios,file,url,...r}:any)=>({...r,assigned:folios.length,revision:revision(r)}))};
 if(action==='admin_events')return {ok:true,timeZone:'America/Ciudad_Juarez',events:s.events.map(({folios,...r}:any)=>({...r,assigned:folios.length,revision:revision(r)}))};
 const own=s.lessons.filter((r:any)=>r.status==='PUBLICADA'&&r.folios.includes(who));
 if(action==='lessons')return {ok:true,lessons:own.map(({folios,file,url,...r}:any)=>({...r,studied:!!s.studied[who+'|'+r.id]}))};
 if(action==='calendar')return {ok:true,timeZone:'America/Ciudad_Juarez',events:[...s.events.filter((e:any)=>e.status==='PUBLICADO'&&e.folios.includes(who)).map(({folios,...e}:any)=>({...e,description:blocked&&['Clase','Examen'].includes(e.type)?'Contenido académico pendiente de confirmación de pago.':e.description})),...own.filter((l:any)=>l.scheduledAt).map((l:any)=>({id:'CLASE-'+l.id,title:l.title,type:'Clase',description:'Consulta el material desde Mis clases.',start:l.scheduledAt,end:'',section:'clases'}))]};
 const row=own.find((r:any)=>r.id===b.id);if(!row)fail('Clase no disponible para tu cuenta.',404);
 if(action==='lesson_studied'){s.studied[who+'|'+row.id]=true;save(s);return {ok:true};}
 if(action==='lesson_link'){if(!row.url)fail('La clase no tiene enlace.',404);return {ok:true,url:row.url};}
 if(action==='lesson_file'){if(!row.file)fail('El archivo no está disponible.',404);return {ok:true,...row.file};}
 fail('Acción no disponible.');
}
