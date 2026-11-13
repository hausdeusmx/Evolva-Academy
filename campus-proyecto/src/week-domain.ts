export function campusDay(value:Date|string=new Date()){const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Ciudad_Juarez',year:'numeric',month:'2-digit',day:'2-digit'}).format(date):'';}
export function weekItems(tasks:any[],events:any[],today=campusDay()){
 const end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+7);const until=end.toISOString().slice(0,10);
 const pending=tasks.filter(t=>!t.locked&&(!t.submission||/correcci[oó]n/i.test(t.submission.status||'')));
 const items=pending.filter(t=>t.dueAt).map(t=>({id:'TAREA-'+t.id,title:t.title,date:campusDay(t.dueAt),section:'tareas',type:'Tarea'}));
 for(const event of events){if(event.type==='Tarea'&&tasks.some(t=>'TAREA-'+t.id===event.id))continue;items.push({id:event.id,title:event.title,date:campusDay(event.start),section:event.section||'calendario',type:event.type||'Evento'});}
 return items.filter(x=>x.date&&x.date<until&&(x.date>=today||x.type==='Tarea')).sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title)).slice(0,12).map(x=>({...x,overdue:x.date<today}));
}
