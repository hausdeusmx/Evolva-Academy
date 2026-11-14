import {enterpriseDemo} from './enterprise-demo';
import {diagnosticSnapshot} from './operational-diagnostics';
const key='evolva-v35-demo-groups';
function rows(){try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return [];}}
export async function experienceV35Demo(action:string,b:any){
 if(action==='v35_incident')return {ok:true};
 if(action==='v35_admin_monitor')return {ok:true,checkedAt:new Date().toISOString(),mail:{pending:0,review:0},incidents:diagnosticSnapshot(),demo:true};
 const capacity=(await enterpriseDemo('v21_admin_capacity',{},null,true)).groups;
 if(action==='v35_admin_groups')return {ok:true,groups:rows(),capacity};
 if(action==='v35_admin_group_save'){
  const id=b.course+'|'+b.group,list=rows(),old=list.find((g:any)=>g.id===id);
  if(!capacity.some((g:any)=>g.course===b.course&&g.group===b.group)||!/^\d{4}-\d{2}-\d{2}$/.test(b.startDate)||!['BORRADOR','PUBLICADO'].includes(b.status))throw Error('Revisa el grupo, la fecha y la visibilidad.');
  if((old?.revision||'')!==(b.revision||''))throw Object.assign(Error('La fecha cambió. Actualiza antes de guardar.'),{status:409});
  const row={id,course:b.course,group:b.group,startDate:b.startDate,status:b.status,revision:crypto.randomUUID()};localStorage.setItem(key,JSON.stringify([...list.filter((g:any)=>g.id!==id),row]));return {ok:true};
 }
 throw Error('Operación de prueba no disponible.');
}
