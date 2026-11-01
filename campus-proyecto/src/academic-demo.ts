import {demoLearners,demoRecords,saveDemoRecords} from './demo-academics';
import {clientId} from './client-id';
const key='evolva-pages::demo-tasks';
export const academicActions=['documents','upload_document','document_file','credential','tasks','submit_task','task_file','submission_file','admin_documents','admin_document_file','admin_tasks','admin_task','admin_task_preview','admin_publish_task','admin_review_task','admin_task_file','admin_submission_file'];
const readTasks=():any[]=>{try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return [];}};
function tasksSave(value:any[]){localStorage.setItem(key,JSON.stringify(value));}
const error=(message:string,status=400)=>Object.assign(Error(message),{status});
function record(records:any,folio:string){return records[folio]??=( {attempts:{},payments:[],read:[],documents:[],submissions:[]} );}
function targets(b:any){const list=demoLearners().filter(s=>b.scope==='student'?s.folio===b.folio:s.course===b.course&&(b.scope!=='group'||s.group===b.group));if(!['student','group','course'].includes(b.scope)||!list.length)throw error('Selecciona los destinatarios.');return list;}
const revision=(s:any)=>JSON.stringify([s.id,s.status,s.score,s.feedback,s.reviewedAt]);
function latest(r:any,id:string){return (r.submissions||[]).filter((s:any)=>s.taskId===id).at(-1)||null;}
function taskDetail(t:any,records:any){return {ok:true,task:t,recipients:t.recipients.map((folio:string)=>{const student=demoLearners().find(s=>s.folio===folio),r=record(records,folio),s=latest(r,t.id),g=r.gradeOverrides?.['TAR-'+t.id];return {student,submission:s?{...s,revision:revision(s)}:null,grade:g?.score??null,gradeRevision:g?JSON.stringify(g):''};})};}
export function academicDemo(role:'student'|'admin',action:string,b:any={},student?:any):any{
 if(role==='student'&&!student)throw error('Inicia sesión para continuar.',401);
 if(action.startsWith('admin_')&&role!=='admin')throw error('Acceso exclusivo para administración.',403);
 const records=demoRecords(),allTasks=readTasks(),folio=String(student?.folio||''),own=role==='student'?record(records,folio):{};
 if(action==='documents')return {ok:true,deliveries:(own.submissions||[]).slice().reverse().map((s:any)=>({...s,taskTitle:allTasks.find(t=>t.id===s.taskId)?.title||'Trabajo entregado'})),documents:(own.documents||[]).map(({base64,...d}:any)=>d).reverse()};
 if(action==='upload_document'){
  const id='DOC-'+b.requestId;own.documents??=[];if(!own.documents.some((d:any)=>d.id===id)){own.documents.push({id,type:b.type,...b.file,size:atob(b.file.base64).length,created:new Date().toISOString()});saveDemoRecords(records);}return {ok:true,documents:own.documents.map(({base64,...d}:any)=>d).reverse()};
 }
 if(action==='admin_documents'){const s=demoLearners().find(s=>s.folio===b.folio);if(!s)throw error('Alumno no encontrado.',404);return {ok:true,student:s,deliveries:(record(records,b.folio).submissions||[]).slice().reverse().map((s:any)=>({...s,taskTitle:allTasks.find(t=>t.id===s.taskId)?.title||'Trabajo entregado'})),documents:(record(records,b.folio).documents||[]).map(({base64,...d}:any)=>d).reverse()};}
 if(['document_file','admin_document_file'].includes(action)){const rows=role==='admin'?Object.values(records).flatMap((r:any)=>r.documents||[]):own.documents||[],d=rows.find((d:any)=>d.id===b.id);if(!d)throw error('Documento no disponible para tu cuenta.',404);return {ok:true,...d};}
 if(action==='credential'){const photo=(own.documents||[]).filter((d:any)=>d.type==='FOTOGRAFIA').at(-1);if(!photo)throw error('Sube tu fotografía en Expediente del alumno para generar tu credencial.');return {ok:true,demo:true,student,photo,issuedAt:new Date().toISOString(),signer:{name:'Alexis Soto',role:'Director General'}};}
 if(action==='admin_task_preview'){const list=targets(b);return {ok:true,count:list.length,fingerprint:list.map(s=>s.folio).sort().join('|')};}
 if(action==='admin_publish_task'){
  const list=targets(b);if(b.fingerprint!==list.map(s=>s.folio).sort().join('|'))throw error('Revisa los destinatarios otra vez.',409);
  if(!b.title?.trim()||!b.description?.trim()||!b.module?.trim())throw error('Completa las instrucciones de la tarea.');
  const id='TA-'+b.requestId;if(!allTasks.some(t=>t.id===id)){allTasks.push({id,title:b.title,description:b.description,module:b.module,dueAt:b.dueAt||'',created:new Date().toISOString(),status:'PUBLICADA',attachment:b.file?{...b.file,size:atob(b.file.base64).length}:null,recipients:list.map(s=>s.folio)});tasksSave(allTasks);}
  for(const s of list){const r=record(records,s.folio);r.gradeOverrides??={};r.gradeOverrides['TAR-'+id]??={id:'TAR-'+id,title:b.title,module:b.module,score:null,status:'Pendiente'};}saveDemoRecords(records);return {ok:true,id,count:list.length};
 }
 if(action==='admin_tasks')return {ok:true,tasks:allTasks.slice().reverse().map(t=>({...t,assigned:t.recipients.length,delivered:t.recipients.filter((f:string)=>latest(record(records,f),t.id)).length,pendingReview:t.recipients.filter((f:string)=>latest(record(records,f),t.id)?.status==='Entregada').length}))};
 if(action==='admin_task'){const t=allTasks.find(t=>t.id===b.id);if(!t)throw error('Tarea no encontrada.',404);return taskDetail(t,records);}
 if(action==='tasks')return {ok:true,tasks:allTasks.filter(t=>t.recipients.includes(folio)).slice().reverse().map(t=>{const s=latest(own,t.id);return {...t,attachment:t.attachment?{name:t.attachment.name,mime:t.attachment.mime,size:t.attachment.size}:null,submission:s?{...s,revision:revision(s)}:null,late:!!s&&!!t.dueAt&&new Date(s.created)>new Date(t.dueAt)};})};
 if(action==='submit_task'){
  const t=allTasks.find(t=>t.id===b.taskId&&t.recipients.includes(folio));if(!t)throw error('Tarea no disponible para tu cuenta.',404);
  own.submissions??=[];const id='EN-'+b.requestId,previous=own.submissions.find((s:any)=>s.id===id);if(previous)return {ok:true,submission:previous};
  const old=latest(own,t.id);if(old&&['Revisada','Calificada'].includes(old.status))throw error('La entrega ya fue revisada. Solicita una corrección.');
  const submission={id,taskId:t.id,comment:b.comment||'',...b.file,size:atob(b.file.base64).length,created:new Date().toISOString(),status:'Entregada',score:null,feedback:'',reviewedAt:''};own.submissions.push(submission);saveDemoRecords(records);return {ok:true,submission};
 }
 if(['task_file','admin_task_file'].includes(action)){const t=allTasks.find(t=>t.id===b.id&&(role==='admin'||t.recipients.includes(folio)));if(!t?.attachment)throw error('Archivo no disponible.',404);return {ok:true,...t.attachment};}
 if(['submission_file','admin_submission_file'].includes(action)){const rows=role==='admin'?Object.values(records).flatMap((r:any)=>r.submissions||[]):own.submissions||[],s=rows.find((s:any)=>s.id===b.id);if(!s)throw error('Entrega no disponible para tu cuenta.',404);return {ok:true,...s};}
 if(action==='admin_review_task'){
  let found:any,owner='';for(const [f,r] of Object.entries(records) as [string,any][]){const s=(r.submissions||[]).find((s:any)=>s.id===b.id);if(s){found=s;owner=f;break;}}
  if(!found)throw error('Entrega no disponible.',404);const r=record(records,owner),t=allTasks.find(t=>t.id===found.taskId),g=r.gradeOverrides['TAR-'+t.id];if(latest(r,t.id)?.id!==found.id||revision(found)!==b.revision)throw error('La entrega cambió. Actualiza antes de revisar.',409);
  const score=b.score===''||b.score===null?null:Number(b.score);if(score!==null){if(!Number.isFinite(score)||score<0||score>10)throw error('Usa una calificación de 0 a 10.');if(JSON.stringify(g)!==b.gradeRevision)throw error('La calificación cambió.',409);g.score=score;g.status=score>=7?'Aprobado':'Reprobado';}
  Object.assign(found,{score,feedback:b.feedback||'',status:b.status==='Requiere corrección'?'Requiere corrección':score===null?'Revisada':'Calificada',reviewedAt:new Date().toISOString()});saveDemoRecords(records);return taskDetail(t,records);
 }
 throw error('Esta acción no está disponible.');
}
