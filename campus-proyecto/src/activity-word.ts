import {strFromU8,strToU8,unzipSync,zipSync} from 'fflate';
import template from './activity-word-template.json';
import {activityForCourse} from './course-activity';
import {studentMatricula} from './student-identity';

export const wordMime='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const normalized=(value:string)=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
const plain=(value:any,max=16000)=>String(value??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').slice(0,max);
const xml=(value:any)=>plain(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
const paragraph=(text:string,style='Normal')=>'<w:p><w:pPr><w:pStyle w:val="'+style+'"/></w:pPr><w:r><w:t xml:space="preserve">'+xml(text)+'</w:t></w:r></w:p>';
const answer=()=>paragraph('[Escribe tu respuesta aquí. Puedes ampliar este espacio.]','Answer');
const filename=(title:string,matricula:string)=>('actividad-'+normalized(title).replace(/[^a-z0-9]+/g,'-').slice(0,65)+'-'+matricula.replace(/[^A-Za-z0-9-]/g,'')+'.docx');

function documentBytes(student:any,title:string,reference:string,body:string){
 if(!student?.name||!student?.course||!studentMatricula(student))throw Error('Actualiza tu cuenta antes de preparar la actividad.');
 const files=unzipSync(Uint8Array.from(atob(template.docx),c=>c.charCodeAt(0)));
 let document=strFromU8(files['word/document.xml']);
 const anchor='<w:p><w:r><w:t>__ACTIVITY_BODY__</w:t></w:r></w:p>';
 if(!document.includes(anchor))throw Error('No se pudo preparar el formato de Word. Actualiza la página.');
 const values:Record<string,string>={ACTIVITY_TITLE:title,COURSE:student.course,STUDENT_NAME:student.name,MATRICULA:studentMatricula(student),GROUP:student.group||'Por asignar',ACTIVITY_REFERENCE:reference};
 for(const[key,value]of Object.entries(values))document=document.replaceAll('{{'+key+'}}',()=>xml(value));
 document=document.replace(anchor,()=>body);
 files['word/document.xml']=strToU8(document);
 return {bytes:zipSync(files,{level:6}),name:filename(title,studentMatricula(student)),mime:wordMime};
}

export function createCourseActivityWord(student:any){
 const activity=activityForCourse(student.course);if(!activity)throw Error('Este curso aún no tiene una actividad guiada. Descarga el Word de una tarea publicada.');
 let body=paragraph('Propósito','Heading1')+paragraph(activity.objective)+paragraph('Cómo trabajar','Heading1')+paragraph('Lee el caso, responde con tus propias palabras y guarda una copia de este documento. Puedes editar todo el contenido y ampliar los espacios. Consulta a tu docente para saber en qué tarea debes entregarlo.')+paragraph('Caso de trabajo','Heading1')+paragraph(activity.case)+paragraph('Resuelve la actividad','Heading1');
 activity.questions.forEach((q,i)=>{body+=paragraph((i+1)+' '+q.title,'Heading2')+paragraph(q.prompt)+answer();});
 body+=paragraph('Antes de entregar','Heading1')+paragraph(activity.checklist.join(' · '))+paragraph('Guarda el archivo con tu matrícula. Si tu docente asignó esta actividad, vuelve a esa tarea y adjunta el DOCX en Seleccionar mi trabajo. La fecha y la calificación se consultan en el campus.');
 for(const source of activity.sources||[])body+=paragraph(source.title,'Source')+paragraph(source.url,'Source');
 return documentBytes(student,activity.title,'Guía inicial del curso',body);
}

export function createAssignedActivityWord(student:any,task:any){
 if(!task?.id||!task?.title||task.locked)throw Error(task?.lockReason||'Esta tarea no está disponible para descargar.');
 const due=task.dueAt&&Number.isFinite(Date.parse(task.dueAt))?new Date(task.dueAt).toLocaleString('es-MX',{timeZone:'America/Ciudad_Juarez',dateStyle:'medium',timeStyle:'short'}):'Sin fecha límite registrada';
 let body=paragraph('Indicaciones de tu docente','Heading1');
 for(const line of plain(task.description,15000).split(/\r?\n/))body+=paragraph(line);
 body+=paragraph('Fecha límite  '+due,'StudentData')+paragraph('Módulo  '+(task.module||'Consulta la tarea en el campus'),'StudentData');
 if(task.attachment?.name)body+=paragraph('Material de apoyo  '+task.attachment.name+'. Descárgalo también desde la tarea en el campus.');
 body+=paragraph('Desarrollo de la actividad','Heading1')+paragraph('Responde las indicaciones de tu docente. Sustituye el texto de ejemplo por tu desarrollo y agrega tablas, imágenes o páginas si lo necesitas.')+answer()+paragraph('Fuentes consultadas','Heading1')+paragraph('[Escribe las fuentes que utilizaste, cuando corresponda.]','Answer')+paragraph('Entrega del archivo','Heading1')+paragraph('Guarda tu DOCX y vuelve a esta misma tarea en el campus. Adjunta el archivo en Seleccionar mi trabajo y pulsa Enviar mi trabajo. Revisa las fechas, la rúbrica y los comentarios de tu docente en el campus antes de entregar.');
 return documentBytes(student,plain(task.title,250),plain(task.id,120),body);
}
