import {clientId} from './client-id';
const records=new Map<string,any>();
export function mailDemo(students:any[],action:string,b:any){
 const dto=(folio:string)=>records.get(folio)||{folio,email:folio.slice(7)+'@evolvacademy.mx',status:'SIN_ASIGNAR',assignedAt:'',deliveredAt:'',revision:'empty-'+folio};
 if(action==='admin_mail_students'){const query=String(b.query||'').toLowerCase(),all=students.filter(s=>[s.name,s.folio,s.course].some(x=>String(x).toLowerCase().includes(query))),offset=Number(b.offset)||0;return {ok:true,total:all.length,students:all.slice(offset,offset+40).map(s=>({...s,mail:dto(s.folio)}))};}
 if(!students.some(s=>s.folio===b.folio))throw Error('Alumno no disponible.');
 const current=dto(b.folio);if(action==='admin_mail_status')return {ok:true,mail:current};
 if(b.revision!==current.revision)throw Object.assign(Error('El acceso cambió. Actualiza el alumno antes de guardar.'),{status:409});
 if(action==='admin_mail_assign'&&(typeof b.password!=='string'||b.password.length<12||b.password.length>128||/[\x00-\x1f\x7f]/.test(b.password)))throw Error('Utiliza una contraseña inicial de 12 a 128 caracteres.');
 if(action==='admin_mail_cancel'&&current.status!=='PENDIENTE')throw Error('No hay una entrega pendiente.');
 const mail={...current,status:action==='admin_mail_cancel'?'CANCELADO':'PENDIENTE',revision:clientId(),assignedAt:new Date().toISOString(),deliveredAt:''};records.set(b.folio,mail);
 // Solo metadatos ficticios en memoria. Ninguna contraseña se conserva en este modo.
 return {ok:true,mail};
}
