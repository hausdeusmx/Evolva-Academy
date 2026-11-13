import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {strFromU8,unzipSync} from 'fflate';
const require=createRequire(import.meta.url),cache=new Map();
function module(name){
 if(cache.has(name))return cache.get(name);
 const source=fs.readFileSync(new URL('../src/'+name+'.ts',import.meta.url),'utf8');
 const exports={};cache.set(name,exports);
 const dependency=id=>id.endsWith('.json')?JSON.parse(fs.readFileSync(new URL('../src/'+id,import.meta.url),'utf8')):id.startsWith('./')?module(id.slice(2)):require(id);
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,require:dependency,atob,Uint8Array,Date,Error,Intl,String},{filename:name+'.js'});return exports;
}
const {createCourseActivityWord,createAssignedActivityWord,wordMime}=module('activity-word');
const {activityForCourse}=module('course-activity');
const catalog=JSON.parse(fs.readFileSync(new URL('../../assets/course-catalog.json',import.meta.url),'utf8'));
const activities=JSON.parse(fs.readFileSync(new URL('../../assets/course-activities.json',import.meta.url),'utf8'));
assert.equal(activities.length,catalog.length);assert.equal(new Set(activities.map(a=>a.course)).size,catalog.length);
const index=process.argv.indexOf('--output-dir'),output=index>=0?process.argv[index+1]:null;if(output)fs.mkdirSync(output,{recursive:true});
const student={name:'Sofía Martínez',folio:'INS-TEST',accountFolio:'EVOLVA-000001',group:'FIN-01',curp:'NEVER_INCLUDE_CURP',email:'never-include@example.test',phone:'NEVER_INCLUDE_PHONE'};
const xml=file=>strFromU8(unzipSync(file.bytes)['word/document.xml']);
for(const course of catalog){
 const activity=activityForCourse(course.name);assert(activity&&activity.id===course.id);assert.equal(activityForCourse('  '+course.name.toUpperCase()+'  ').id,course.id);assert.equal(activity.questions.length,3);
 const file=createCourseActivityWord({...student,course:course.name}),files=unzipSync(file.bytes),body=xml(file);
 assert.equal(file.mime,wordMime);assert(file.name.endsWith('-EVOLVA-000001.docx'));assert(file.bytes.length>1000&&file.bytes.length<2*1024*1024);
 for(const text of [course.name,activity.title,'Sofía Martínez','EVOLVA-000001','[Escribe tu respuesta aquí. Puedes ampliar este espacio.]'])assert(body.includes(text));
 assert(!body.includes('{{')&&!body.includes('__ACTIVITY_BODY__'));assert(!body.includes('INS-TEST')&&!body.includes('NEVER_INCLUDE')&&!body.includes('never-include@example.test'));
 assert(files['[Content_Types].xml']&&files['word/styles.xml']&&files['word/header1.xml']);assert(Object.keys(files).some(k=>k.startsWith('word/media/')));assert(!Object.keys(files).some(k=>/vbaProject|externalLink/i.test(k)));assert(!strFromU8(files['word/settings.xml']).includes('w:documentProtection'));
 if(output)fs.writeFileSync(path.join(output,course.id+'.docx'),file.bytes);
}
assert.equal(activityForCourse('Curso que no existe'),undefined);assert.throws(()=>createCourseActivityWord({...student,course:'Curso que no existe'}),/aún no tiene/);
const task={id:'TAREA-PRIVATE-001',title:'Reporte autorizado de práctica',module:'Módulo 1',description:'Responde <preguntas> & usa "tus palabras".\nConserva los datos $& sin interpretar.',dueAt:'2026-11-20T18:00:00Z',attachment:{name:'material-del-docente.pdf'}};
const file=createAssignedActivityWord({...student,name:'María <A&B> $&',course:'Finanzas Personales'},task),body=xml(file);
assert(body.includes('María &lt;A&amp;B&gt; $&amp;'));assert(body.includes('Responde &lt;preguntas&gt; &amp; usa &quot;tus palabras&quot;.'));assert(body.includes('datos $&amp; sin interpretar.'));assert(body.includes(task.id)&&body.includes(task.attachment.name));assert(!body.includes(activities[0].case),'A teacher task must keep its own instructions, not another activity');
assert.throws(()=>createAssignedActivityWord({...student,course:'Finanzas Personales'},{...task,locked:true,lockReason:'Completa el módulo previo.'}),/Completa el módulo previo/);
assert.throws(()=>createAssignedActivityWord({...student,course:'Finanzas Personales'},{...task,id:''}),/no está disponible/);
assert.throws(()=>createCourseActivityWord({course:'Finanzas Personales'}),/Actualiza tu cuenta/);
if(output)fs.writeFileSync(path.join(output,'tarea-publicada.docx'),file.bytes);
console.log('Editable Word activities passed: seven correct courses, real DOCX packages, editable answers, stable matrícula, minimal student data, XML escaping, private task instructions, locked task denial and no invented assignments or grades.');
