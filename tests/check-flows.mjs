import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=async name=>readFile(path.join(root,'assets',name),'utf8');
class Element{
  constructor(){this.value='';this.textContent='';this.style={};this.listeners={};this.attributes={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
  addEventListener(name,fn){this.listeners[name]=fn;}
  setAttribute(name,value){this.attributes[name]=value;}
  removeAttribute(name){delete this.attributes[name];}
  focus(){this.focused=true;}
  scrollIntoView(){}
  reportValidity(){return true;}
  remove(){this.removed=true;}
}
async function setup(page,script,search=''){
  const html=await readFile(path.join(root,page),'utf8');
  const elements=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
  const selected=new Element();selected.value='Finanzas Personales';
  const scripts=[];
  const timers=new Map();let counter=0;
  const context={URLSearchParams,Date,Math,Number,String,Error,AbortSignal,Uint8Array,crypto,File,btoa,location:{search},setTimeout:fn=>{timers.set(++counter,fn);return counter;},clearTimeout:id=>timers.delete(id),document:{getElementById:id=>{assert(elements.has(id),'Missing element '+id);return elements.get(id);},querySelector:()=>selected,createElement:()=>new Element(),head:{appendChild:el=>scripts.push(el)}}};
  context.window=context;if(elements.has('reg_phone'))elements.get('reg_phone').disabled=true;
  vm.createContext(context);vm.runInContext(await source('legacy-api.js'),context);vm.runInContext(await source('registro-documentos.js'),context);
  const calls=[];
  let response={};let failure;
  context.EvolvaLegacy.call=async(url,params)=>{calls.push({url,params});if(failure)throw failure;return response;};
  context.turnstile={getResponse:()=> 'synthetic-test-token',reset(){}};
  vm.runInContext(await source(script),context);
  return {context,elements,calls,selected,scripts,timers,setResponse:v=>response=v,setFailure:v=>failure=v,submit:async id=>{await elements.get(id).listeners.submit({preventDefault(){}});await new Promise(resolve=>setImmediate(resolve));}};
}

const r=await setup('inscripcion.html','registro.js','?diplomado=Primeros+Auxilios');
assert.equal(r.elements.get('cursoAuxilios').checked,true,'Course deep link preselects the course');
for(const [id,value] of Object.entries({reg_nombre:'Alumno de prueba',reg_edad:'25',reg_estado:'Chihuahua',reg_curp:'XXXXXXXXXXXXXXXXXX',reg_fecha:'2001-01-01',reg_email:'alumno@example.invalid'}))r.elements.get(id).value=value;
r.context.turnstile.getResponse=()=>'';
await r.submit('registroForm');assert.equal(r.calls.length,0,'No registration is sent without verification');
assert.match(r.elements.get('captchaError').textContent,/verificación/);
r.context.turnstile.getResponse=()=> 'synthetic-test-token';
r.setResponse({ok:true,folio:'EVOLVA-000123',password:'synthetic-demo-only',alumno:{CORREO_PERSONAL:'alumno@example.invalid'}});
await r.submit('registroForm');
assert.equal(r.calls[0].params.accion,'registrar');
assert.equal(r.calls[0].params.curp,'XXXXXXXXXXXXXXXXXX');
assert.equal(r.calls[0].params.turnstileToken,'synthetic-test-token');
assert.equal(r.elements.get('codigoFolio').textContent,'EVOLVA-000123');
assert.equal(r.elements.get('registroPago').href,'pagos.html?folio=EVOLVA-000123');
assert.equal(r.elements.get('registroForm').style.display,'none');
assert.equal(r.elements.get('registroButton').disabled,false);
const bad=await setup('inscripcion.html','registro.js');
bad.setResponse({ok:false,error:'Registro rechazado'});await bad.submit('registroForm');
assert.equal(bad.elements.get('registroError').textContent,'Registro rechazado');
assert.notEqual(bad.elements.get('registroForm').style.display,'none');
const noFolio=await setup('inscripcion.html','registro.js');noFolio.setResponse({ok:true});await noFolio.submit('registroForm');
assert.match(noFolio.elements.get('registroError').textContent,/folio válido/);
const connected=await setup('inscripcion.html','registro.js');
for(const [id,value] of Object.entries({reg_nombre:'Alumno de prueba',reg_edad:'25',reg_estado:'Chihuahua',reg_curp:'XXXXXXXXXXXXXXXXXX',reg_fecha:'2001-01-01',reg_email:'nuevo@example.invalid'}))connected.elements.get(id).value=value;
connected.context.EVOLVA_CONFIG={API_URL:'https://script.google.com/macros/s/SYNTHETIC_TEST_ENDPOINT/exec'};
let posted;
connected.context.fetch=async(url,options)=>{posted={url,options};return {ok:true,json:async()=>({ok:true,folio:'EVOLVA-000456',password:'synthetic-test-only'})};};
await connected.submit('registroForm');
assert.equal(connected.calls.length,0,'Configured registration must not fall back to JSONP');
assert.equal(posted.options.method,'POST');assert.equal(posted.options.credentials,'omit');
assert.equal(JSON.parse(posted.options.body).action,'register');
assert(!posted.url.includes('curp='),'Personal fields are not sent in a URL');
assert.equal(connected.elements.get('codigoFolio').textContent,'EVOLVA-000456');

const docs=await setup('inscripcion.html','registro.js');
for(const [id,value] of Object.entries({reg_nombre:'Alumno de prueba',reg_edad:'25',reg_estado:'Chihuahua',reg_curp:'XXXXXXXXXXXXXXXXXX',reg_fecha:'2001-01-01',reg_email:'expediente@example.invalid'}))docs.elements.get(id).value=value;
docs.context.EVOLVA_CONFIG={API_URL:'https://script.google.com/macros/s/SYNTHETIC_TEST_ENDPOINT/exec'};
const docPosts=[];docs.context.fetch=async(url,options)=>{const body=JSON.parse(options.body);docPosts.push(body);return {ok:true,json:async()=>body.action==='health'?{ok:true,version:5,features:['documents','credential','tasks']}:{ok:true,folio:'EVOLVA-000789',password:'synthetic-password'}};};
docs.elements.get('reg_curp_pdf').files=[new File(['%PDF-1.4\nSynthetic CURP'],'curp.pdf',{type:'application/pdf'})];
docs.elements.get('reg_photo').files=[new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jqE4AAAAASUVORK5CYII=','base64')],'foto.png',{type:'image/png'})];
await docs.submit('registroForm');const docPost=docPosts.find(p=>p.action==='register');assert.ok(docPost);assert.equal(docPost.curpFile.mime,'application/pdf');assert.equal(docPost.photoFile.mime,'image/png');assert.match(docPost.requestId,/^[a-f0-9-]{36}$/);assert.equal(docs.elements.get('reg_photo').required,true);assert.equal(docs.elements.get('registroDocumentos').hidden,false);assert.equal(docs.calls.length,0,'Enrollment documents never use JSONP');
const missingPhoto=await setup('inscripcion.html','registro.js');missingPhoto.context.EVOLVA_CONFIG=docs.context.EVOLVA_CONFIG;let registrationsWithoutPhoto=0;missingPhoto.context.fetch=async(url,options)=>{const p=JSON.parse(options.body);if(p.action==='register')registrationsWithoutPhoto++;return {ok:true,json:async()=>({ok:true,version:5,features:['documents']})};};missingPhoto.elements.get('reg_curp_pdf').files=docs.elements.get('reg_curp_pdf').files;missingPhoto.elements.get('reg_photo').files=[];await missingPhoto.submit('registroForm');assert.equal(registrationsWithoutPhoto,0,'V5 enrollment cannot be sent without a photograph');assert.match(missingPhoto.elements.get('registroError').textContent,/fotografía/);

// New courses cannot enroll against an older API and never use the legacy payment link.
const newCourses=JSON.parse(await readFile(path.join(root,'assets/course-catalog.json'),'utf8')).filter(c=>!c.legacy);
for(const [index,c] of newCourses.entries()){
 const entry=await setup('inscripcion.html','registro.js');entry.selected.value=c.name;
 for(const [id,value] of Object.entries({reg_nombre:'Alumno de prueba',reg_edad:'25',reg_estado:'Chihuahua',reg_curp:'CURSO0000000000000',reg_fecha:'2001-01-01',reg_email:'catalogo@example.invalid'}))entry.elements.get(id).value=value;
 entry.context.EVOLVA_CONFIG={API_URL:'https://script.google.com/macros/s/SYNTHETIC_CATALOG_TEST/exec'};vm.runInContext(await source('course-catalog.js'),entry.context);
 entry.elements.get('reg_curp_pdf').files=docs.elements.get('reg_curp_pdf').files;entry.elements.get('reg_photo').files=docs.elements.get('reg_photo').files;
 let active=false,registrations=0;entry.context.fetch=async(url,options)=>{const body=JSON.parse(options.body);if(body.action==='health')return {ok:true,json:async()=>({ok:true,version:active?11:10,features:['documents',...(active?['course_catalog']:[])]})};registrations++;assert.equal(body.diplomado,c.name);assert.equal(body.curpFile.mime,'application/pdf');return {ok:true,json:async()=>({ok:true,folio:'EVOLVA-'+String(700+index).padStart(6,'0'),password:'synthetic-catalog-test'})};};
 await entry.submit('registroForm');assert.equal(registrations,0);assert.match(entry.elements.get('registroError').textContent,/preparación/);
 active=true;await entry.submit('registroForm');assert.equal(registrations,1);assert.equal(entry.elements.get('registroPago').href,'campus/?seccion=pagos');assert.equal(entry.calls.length,0);
}
console.log('V11 enrollment checks passed: five course contracts, activation pending, private documents and campus payment handoff.');

for(const name of ['alumnos.html','calificaciones.html','certificado.html','correos.html','validar.html','pagos.html']){
 const html=await readFile(path.join(root,name),'utf8');
 assert(!/script.google.com|accion[:=]|buscarFolio|buscarfolio|const API_URL/i.test(html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/g,'')),name+' must not query academic records publicly');
 assert(html.includes('campus/'),name+' must direct personal queries to the campus');
}
const paymentPage=await readFile(path.join(root,'pagos.html'),'utf8');
const oldGradeRoute=await readFile(path.join(root,'calificaciones'),'utf8');
assert(!/script.google.com|buscarFolio/i.test(oldGradeRoute),'The old extensionless route cannot query records');
assert(paymentPage.includes('https://buy.stripe.com/8x228r3Wz2CE8zU3Wj2sM00'),'The existing checkout link is preserved');
assert(!paymentPage.includes('pagoConsulta'),'No public payment record lookup');
const api=await setup('inscripcion.html','registro.js');
vm.runInContext(await source('legacy-api.js'),api.context);
const pending=api.context.EvolvaLegacy.call('https://example.invalid/exec',{accion:'registrar'});
const inserted=api.scripts.at(-1),url=new URL(inserted.src),callback=url.searchParams.get('callback');
assert.equal(url.searchParams.get('accion'),'registrar');
api.context[callback]({ok:true});assert.equal((await pending).ok,true);assert(inserted.removed);assert.equal(api.context[callback],undefined);assert.equal(api.timers.size,0);
const timedOut=api.context.EvolvaLegacy.call('https://example.invalid/exec',{});
[...api.timers.values()][0]();await assert.rejects(timedOut,/tardó demasiado/);assert.equal(api.timers.size,0);
console.log('PASS: registration contract, verification required, course selection, folio handoff, rejected responses, timeout cleanup, existing checkout and no public academic record queries. No live requests were sent.');

// V12 phone field is enabled only after private persistence is ready.
const phoneEntry12=await setup('inscripcion.html','registro.js');
for(const [id,value] of Object.entries({reg_nombre:'Alumno teléfono prueba',reg_edad:'25',reg_estado:'Chihuahua',reg_curp:'PPPPPPPPPPPPPPPPPP',reg_fecha:'2001-01-01',reg_email:'phone@example.test'}))phoneEntry12.elements.get(id).value=value;
phoneEntry12.elements.get('reg_curp_pdf').files=docs.elements.get('reg_curp_pdf').files;phoneEntry12.elements.get('reg_photo').files=docs.elements.get('reg_photo').files;
phoneEntry12.context.EVOLVA_CONFIG={API_URL:'https://script.google.com/macros/s/SYNTHETIC_TEST_ENDPOINT/exec'};let phonePost12;phoneEntry12.context.fetch=async(_url,options)=>{const b=JSON.parse(options.body);if(b.action==='health')return {ok:true,json:async()=>({ok:true,version:12,features:['documents','course_catalog','student_contact']})};phonePost12=b;return {ok:true,json:async()=>({ok:true,folio:'EVOLVA-000888',password:'synthetic'})};};
phoneEntry12.elements.get('reg_phone').value='12';await phoneEntry12.submit('registroForm');assert.equal(phonePost12,undefined);assert.match(phoneEntry12.elements.get('registroError').textContent,/teléfono/);
phoneEntry12.elements.get('reg_phone').value='+52 (656) 000-0001';await phoneEntry12.submit('registroForm');assert.equal(phonePost12.telefono,'+526560000001');assert.equal(phoneEntry12.calls.length,0);assert.equal(phoneEntry12.elements.get('reg_phone').required,true);console.log('V12 phone enrollment passed: capability gating, invalid number rejection and private POST persistence contract.');
