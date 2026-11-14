import {createReadCache} from './request-cache';
import {recordIncident,setIncidentReporter,clearDiagnostics} from './operational-diagnostics';
import {experienceDemo} from './experience-demo';
import {portalHealth} from './portal-health';
import {servicesV26Demo} from './services-v26-demo';
import {admissionExperienceDemo} from './admission-experience-demo';
import {enterpriseDemo} from './enterprise-demo';
import {operationsDemo} from './operations-demo';
import {schoolDemo,schoolDemoDashboard,schoolDemoCertificate} from './school-demo';
import {activeEnrollment,selectEnrollment} from './academy-context';
import {academyActions,academyDemo,demoCertificate,demoEnrollmentStudent,demoCoursePlan} from './academy-demo';
import {nativeApp,nativeAvailable} from './native-app';
import {isAppExperience} from './app-experience';
import {readDeviceToken,saveDeviceToken} from './device-vault';
import {demoMailAvailability} from './mail-demo';
import {profileValues,studentProfileChanges} from './profile-data';
import {paymentCalendar} from './course-plan';
import {normalizeStudentPhone} from './credential-contact';
import {suiteDemo,suiteAcademicDemo} from './suite-demo';
import {learningActions,learningDemo} from './learning-demo';
import {academicAccess,requireAcademicAccess,protectedAcademicActions} from './academic-access';
import {paymentDashboard} from './payment-settings';
import {academicActions,academicDemo} from './academic-demo';
import {demoAcademic,demoLearners,demoRecords,saveDemoRecords} from './demo-academics';
import {DEMO_EMAIL,DEMO_GRADUATE,DEMO_LOGIN_EMAIL,DEMO_GRADUATE_LOGIN,DEMO_PASSWORD,demoStudent,baseGrades,summary,exams,gradeExam,demoNotices} from './domain';
import {createReportMetadata,reportSnapshot,validReportCode,sha256} from './report-record';
declare global{interface Window{EVOLVA_CONFIG?:{API_URL?:string;DEMO_MODE?:boolean}}}
const cfg=window.EVOLVA_CONFIG||{},endpoint=String(cfg.API_URL||'').trim(),demo=!endpoint&&cfg.DEMO_MODE===true;
const namespace='evolva-pages:'+endpoint;
const sessionStore=isAppExperience?localStorage:sessionStorage;
let session=sessionStore.getItem(namespace+':session')||sessionStorage.getItem(namespace+':session')||'';
let supportsDeviceSession=false,authEpoch=0,renewal:Promise<void>|null=null;
function saveSession(value:string){session=value;if(value)sessionStore.setItem(namespace+':session',value);else{localStorage.removeItem(namespace+':session');sessionStorage.removeItem(namespace+':session');}}
async function renewSession(){if(!isAppExperience||!supportsDeviceSession)return false;const token=await readDeviceToken(namespace);if(!token)return false;if(!renewal){const epoch=authEpoch;renewal=(async()=>{try{const data=await post('refresh_session',{refreshToken:token});if(epoch!==authEpoch)throw Error('La cuenta cambió. Vuelve a intentar.');saveSession(data.session);}catch(error:any){if(error.status===401&&epoch===authEpoch){saveSession('');await saveDeviceToken(namespace,'');}throw error;}})().finally(()=>{renewal=null;});}await renewal;return true;}
const materialsCache=createReadCache(15000,12);
const pendingReads=new Map<string,Promise<any>>();
const readActions=new Set(['v35_student_hub','dashboard','session','credential','documents','student_profile','tasks','lessons','calendar','folio','v30_notes','v30_portfolio','v30_review']);
async function health(force=false){const d=await portalHealth(endpoint,force);supportsDeviceSession=d.features?.includes('persistent_sessions')===true;if(d.features?.includes('operations_monitor'))setIncidentReporter(i=>post('v35_incident',{operation:i.action,status:i.status}));return d;}
async function real(action:string,body:any={}){
 if(action==='health')return health(body.force===true);
 const epoch=authEpoch,enrollment=activeEnrollment(),key=JSON.stringify([epoch,session,enrollment,action,body]);
 const run=async()=>{let d;try{d=await post(action,body);}catch(error:any){if(error.status!==401||['login','logout','refresh_session','logout_device','request_password_reset','reset_password'].includes(action))throw error;if(isAppExperience&&!supportsDeviceSession)await health();if(await renewSession())d=await post(action,body);else{saveSession('');throw error;}}if(readActions.has(action)&&(epoch!==authEpoch||enrollment!==activeEnrollment()))throw Object.assign(Error('La cuenta o el curso cambió. Vuelve a consultar.'),{status:409});return d;};
 if(!readActions.has(action)){pendingReads.clear();materialsCache.clear();return run();}
 const pending=pendingReads.get(key);if(pending)return pending;
 const work=run().finally(()=>{if(pendingReads.get(key)===work)pendingReads.delete(key);});pendingReads.set(key,work);return work;
}
const read=(key:string,fallback:any)=>{try{return JSON.parse((isAppExperience?localStorage:sessionStorage).getItem(namespace+':'+key)||'null')??fallback;}catch{return fallback;}};
const save=(key:string,v:any)=>(isAppExperience?localStorage:sessionStorage).setItem(namespace+':'+key,JSON.stringify(v));
const selected=()=>{const student=read('demo-student',null);return student?demoEnrollmentStudent(demoLearners().find(s=>s.folio===student.folio)||student)||null:null;};
const state=()=>demoRecords();
async function post(action:string,body:any={}){if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('La administración todavía debe configurar la conexión del campus.');let r:Response;try{r=await fetch(endpoint,{method:'POST',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,session,enrollment:activeEnrollment(),...body}),signal:AbortSignal.timeout(action==='v25_dossier'?90000:['upload_document','submit_task'].includes(action)?60000:25000)});}catch{throw Error('No se pudo conectar con el campus. Revisa tu conexión y vuelve a intentar.');}let d:any;try{d=await r.json();}catch{throw Error('La conexión no devolvió una respuesta válida. Solicita apoyo a administración.');}if(!d.ok){const e:any=Error(d.error||'No se pudo completar la solicitud.');e.status=d.status||400;e.code=d.code||'';throw e;}return d;}
function demoDashboard(){const s=selected();if(!s)throw Object.assign(Error('Inicia sesión para continuar.'),{status:401});const academic=demoAcademic(s),records=academic.record;return schoolDemoDashboard({demo:true,mailAccess:demoMailAvailability(s.folio),student:s,grades:academic.grades,average:academic.average,progress:academic.progress,modules:academic.grades,exams:academic.exams,notices:demoNotices.map(n=>({...n,read:(records.read||[]).includes(n.id)})),payments:records.payments||[],certificate:demoCertificate(s),plan:demoCoursePlan(s.course)||{monthly:400,weekly:100,months:6}});}
function updateDemo(fn:(s:any)=>void){const who=selected();if(!who)throw Object.assign(Error('Inicia sesión para continuar.'),{status:401});const records=state();records[who.folio]??={attempts:{},payments:[],read:[]};fn(records[who.folio]);saveDemoRecords(records);}
async function request(action:string,body:any={},params=''):Promise<any>{const q=new URLSearchParams(params);if(action==='status'){if(demo)return {authenticated:!!selected(),connected:false,admin:false,institutionalLogin:true,demoAccounts:{email:DEMO_LOGIN_EMAIL,graduate:DEMO_GRADUATE_LOGIN,password:DEMO_PASSWORD}};if(!endpoint)return {authenticated:false,connected:false,admin:false,demoAccounts:null};const healthTask=health();let dashboardTask:Promise<any>|null=session?real('dashboard'):null;dashboardTask?.catch(()=>{});
 const info=await healthTask,institutionalLogin=info.version>=14&&info.features?.includes('institutional_login')===true;
 if(!session&&!dashboardTask){try{await renewSession();}catch(error:any){if(error.status!==401)throw error;}if(session)dashboardTask=real('dashboard');}
 const flags={connected:true,admin:false,institutionalLogin,demoAccounts:null};
 if(!dashboardTask)return {authenticated:false,...flags};
 try{const dashboard=await dashboardTask;if(nativeAvailable()&&dashboard.student?.folio)await nativeApp('bindAccount',{owner:dashboard.student.accountFolio||dashboard.student.folio});return {authenticated:true,...flags,dashboard};}catch(e:any){if(e.status===401)return {authenticated:false,...flags};throw e;}}

 if(action==='login'){selectEnrollment('');if(demo){const email=String(body.email||'').trim().toLowerCase();const learner=demoLearners().find(s=>s.institutional===email);if(!learner||body.password!==DEMO_PASSWORD)throw Error('Correo o contraseña incorrectos.');save('demo-student',learner);return {ok:true};}authEpoch++;const d=await real('login',{...body,firstAccessProtocol:1,remember:isAppExperience&&supportsDeviceSession});if(d.passwordChangeRequired===true){if(!/^[a-f0-9]{64}$/.test(String(d.setupToken||''))||d.session||d.refreshToken||!(Date.parse(d.expiresAt)>Date.now()))throw Error('No se pudo preparar el primer acceso. Solicita un enlace desde Recuperar acceso.');saveSession('');if(isAppExperience)await saveDeviceToken(namespace,'');if(nativeAvailable())await nativeApp('clearPrivateData').catch(()=>{});return d;}saveSession(d.session);if(isAppExperience&&d.refreshToken){try{await saveDeviceToken(namespace,d.refreshToken);}catch(error){await post('logout_device',{refreshToken:d.refreshToken}).catch(()=>{});saveSession('');throw error;}}if(nativeAvailable()&&d.student?.folio)await nativeApp('bindAccount',{owner:d.student.accountFolio||d.student.folio});return d;}
 if(action==='logout'){authEpoch++;selectEnrollment('');if(nativeAvailable())await nativeApp('clearPrivateData').catch(()=>{});try{if(!demo){const token=isAppExperience?await readDeviceToken(namespace):'';if(token)await post('logout_device',{refreshToken:token});else if(session)await post('logout');}}finally{saveSession('');if(isAppExperience)await saveDeviceToken(namespace,'');sessionStorage.removeItem(namespace+':demo-student');if(isAppExperience)localStorage.removeItem(namespace+':demo-student');}return {ok:true};}
 if(!demo){if(action==='payment'){const form=body as FormData,file=form.get('file') as File;if(!file||file.size>2*1024*1024)throw Error('Adjunta un PDF, JPG o PNG de hasta 2 MB.');return real('payment',{amount:Number(form.get('amount')),reference:form.get('reference'),period:form.get('period'),requestId:form.get('requestId'),mime:file.type,name:file.name,base64:await base64File(file)});}if(action==='exam')throw Error('Abre la evaluación desde su enlace institucional.');return real(action,{...body,...Object.fromEntries(q)});}
 if(action==='validate'){if(!selected())throw Object.assign(Error('Inicia sesión en el campus para validar este reporte.'),{status:401});const code=String(q.get('code')||'').toUpperCase(),r=read('reports',{})[code];if(!validReportCode(code)||!r||r.snapshot.student.folio!==selected().folio)throw Object.assign(Error('No se encontró un reporte accesible con este código.'),{status:404});return {ok:true,status:'vigente',...r.snapshot,...r.meta,fingerprint:r.fingerprint};}
 if(action==='health')return {ok:true,version:26,features:['student_notes','project_portfolio','public_testimonials','student_requests','card_checkout','offline_reading_sync','guardian_portal','achievement_badges','audit_history','document_corrections','delivery_bounces','welcome_guide','private_dossier','admission_sla','course_editor','student_import','area_permissions','study_letters','group_capacity','finance_dashboard','document_reviews','student_followup','private_backups','job_board','referrals','teacher_portal','campus_exams','attendance','certificate_qr','scholarships','advising','module_rules','device_management','privacy_information','same_matricula','certificate_management','app_updates','multi_course','group_chat','reminders','email_campaigns','institutional_notice','institutional_login','student_profile','automatic_groups','student_contact','course_catalog','followup','support','rubrics','receipts','reports','surveys','documents','credential','tasks','payment_access','payment_review','lessons','calendar','password_recovery']};
 if(action==='request_password_reset'||action==='reset_password')throw Error('Esta demostración no envía correos ni cambia contraseñas reales.');
 if(action.startsWith('v30_'))return experienceDemo(action,body,selected(),false);
 if(action.startsWith('v26_'))return servicesV26Demo(action,body,selected(),false);
 if(action.startsWith('v25_'))return admissionExperienceDemo(action,body,selected(),false);
 if(action.startsWith('v21_')||action.startsWith('v22_'))return enterpriseDemo(action,body,selected(),false);
 if(action.startsWith('v20_'))return operationsDemo(action,body,selected(),false);
 if(action.startsWith('v19_'))return schoolDemo(action,body,selected(),false);
 if(academyActions.includes(action))return academyDemo(action,body,selected());
 if(action.startsWith('suite_'))return suiteDemo(false,action,body||{},selected());
 if(learningActions.includes(action))return learningDemo('student',action,body||{},selected());
 if(academicActions.includes(action))return suiteAcademicDemo('student',action,body||{},selected());
 const d=demoDashboard();
 if(action==='student_profile')return {ok:true,student:d.student,revision:JSON.stringify(profileValues(d.student))};
 if(action==='update_profile'){
  if(body.folio&&body.folio!==d.student.folio)throw Object.assign(Error('Solo puedes actualizar tu propia cuenta.'),{status:403});
  if(!body.changes||Array.isArray(body.changes)||Object.keys(body.changes).some(k=>!['name','email','phone'].includes(k)||typeof body.changes[k]!=='string'))throw Error('Revisa los datos de tu perfil.');
  const previous=profileValues(d.student);if(body.revision!==JSON.stringify(previous))throw Object.assign(Error('Tus datos cambiaron. Recarga antes de guardar.'),{status:409});
  const changes=studentProfileChanges(previous,{...previous,...body.changes});
  if(changes.email&&body.currentPassword!==DEMO_PASSWORD)throw Error('La contraseña actual es incorrecta.');
  if(changes.email&&demoLearners().some(s=>s.folio!==d.student.folio&&[s.email,s.institutional].includes(changes.email!)))throw Error('Ese correo no está disponible. Usa otro o solicita ayuda.');
  updateDemo(s=>{s.profile={...s.profile,...(changes.name?{name:changes.name}:{}),...(changes.email?{email:changes.email}:{})};if(changes.phone!==undefined)s.phone=changes.phone;});const student=selected();return {ok:true,student,revision:JSON.stringify(profileValues(student))};
 }
 if(action==='session')return {ok:true,student:d.student};if(action==='update_contact'){if(body.folio&&body.folio!==d.student.folio)throw Object.assign(Error('Solo puedes actualizar tu propia cuenta.'),{status:403});const phone=normalizeStudentPhone(body.phone);updateDemo(s=>{s.phone=phone;});return {ok:true,student:{...d.student,phone}};}if(action==='dashboard')return d;
 if(action==='folio'){if(q.get('folio')?.trim().toUpperCase()!==(d.student.matricula||d.student.accountFolio||d.student.folio))throw Error('La matrícula no corresponde a tu cuenta.');return {student:d.student,progress:d.progress,average:d.average};}
 if(action==='read'){updateDemo(s=>{if(!s.read.includes(body.id))s.read.push(body.id);});return {ok:true};}
 if(action==='exam'){const id=q.get('id')||'',e=exams.find(e=>e.id===id),x=d.exams.find((e:any)=>e.id===id);if(!e||x?.locked)throw Error('Esta evaluación no está disponible.');if(!body?.answers)return {...e,questions:e.questions.map(({correct,...v})=>v)};if(x?.score!==null)throw Error('Esta evaluación ya fue enviada.');const score=gradeExam(id,body.answers);updateDemo(s=>s.attempts[id]=score);return {ok:true,score};}
 if(action==='payment'){const form=body as FormData,file=form.get('file') as File,amount=Number(form.get('amount')),reference=String(form.get('reference')),period=String(form.get('period'));if(!file||file.size>2*1024*1024||!file.size||!['application/pdf','image/png','image/jpeg'].includes(file.type))throw Error('Adjunta un PDF, JPG o PNG de hasta 2 MB.');if(!Number.isFinite(amount)||amount<=0)throw Error('Revisa el monto.');const content=await base64File(file);updateDemo(s=>{if(s.payments.some((p:any)=>p.reference===reference&&p.period===period))throw Error('Esta referencia ya está registrada.');s.payments.unshift({id:crypto.randomUUID?.()||String(Date.now()),amount,reference,period,status:'En revisión',created:new Date().toISOString(),proof:true,base64:content,mime:file.type});});return {ok:true};}
 if(action==='proof'){const p=d.payments.find((p:any)=>p.id===body.id);if(!p)throw Error('Comprobante no encontrado.');return {ok:true,base64:p.base64,mime:p.mime};}
 if(action==='issue_report'){const snapshot=reportSnapshot(d),meta=createReportMetadata();meta.validationUrl=new URL('./validar/?codigo='+meta.code,typeof document!=='undefined'&&document.baseURI||(/^https:\/\//.test(window.location.href)?window.location.href:'https://evolvacademy.mx/campus/')).toString();const fingerprint=await sha256(JSON.stringify(snapshot)),all=read('reports',{});all[meta.code]={snapshot,meta,fingerprint};save('reports',all);return {ok:true,snapshot,meta};}
 if(action==='certificate'){if(!d.certificate.eligible)throw Error('La constancia todavía no está autorizada.');return {ok:true,data:schoolDemoCertificate(d)};}
 throw Error('Esta acción no está disponible.');
}
export async function portalAPI(action:string,body?:any,params=''){
 if(action==='logout'){materialsCache.clear();clearDiagnostics();}
 let latest:any=null;
 const serverChecks=!demo&&(protectedAcademicActions.includes(action)||action==='documents')&&(await health()).features?.includes('payment_access')===true;
 if(!serverChecks&&(protectedAcademicActions.includes(action)||action==='documents'))latest=await request('dashboard');
 if(!serverChecks&&protectedAcademicActions.includes(action))requireAcademicAccess(latest);
 if(action==='exam_link'&&!serverChecks&&!latest.academicAccess?.enforced){const exam=latest.exams.find((e:any)=>e.id===body?.id);if(!exam||exam.locked||!/^https:\/\//.test(exam.url||''))throw Error('El examen no está disponible para tu cuenta.');return {ok:true,url:exam.url};}
 let d;try{d=await request(action,body,params);}catch(error:any){recordIncident(action,error?.status||0);throw error;}
 if(action==='documents'&&!serverChecks&&academicAccess(latest).blocked)return {...d,deliveries:[]};
 if(action==='status'&&d.dashboard?.student)return {...d,dashboard:paymentCalendar(paymentDashboard(d.dashboard))};
 return action==='dashboard'?paymentCalendar(paymentDashboard(d)):d;
}
export async function portalTransport(action:string,body?:any,params=''){try{return Response.json(await portalAPI(action,body,params));}catch(e:any){return Response.json({error:e.message},{status:e.status||400});}}
async function base64File(file:File){const bytes=new Uint8Array(await file.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);}
export async function downloadFile(action:string,options:any){let bytes:Uint8Array,mime='application/pdf',name='documento.pdf';if(action==='proof'){const d=await request('proof',options);bytes=Uint8Array.from(atob(d.base64),c=>c.charCodeAt(0));mime=d.mime;name='comprobante.'+(mime==='application/pdf'?'pdf':mime==='image/png'?'png':'jpg');}else if(options.kind==='boleta'){const d=await request('issue_report'),{createAcademicReportPDF}=await import('./report-pdf');const extra=(options.student?.matricula||options.student?.accountFolio||options.student?.folio)===d.snapshot.student.folio?{status:options.student.status,registered:options.student.registered}:{};bytes=await createAcademicReportPDF({...d.snapshot,student:{...d.snapshot.student,...extra}},d.meta);name='reporte-academico-'+d.snapshot.student.folio+'.pdf';}else{const d=await request('certificate');if(d.base64)bytes=Uint8Array.from(atob(d.base64),c=>c.charCodeAt(0));else{const{createCompletionCertificatePDF}=await import('./certificate-pdf');bytes=await createCompletionCertificatePDF(d.data);}name='constancia-finalizacion-'+(d.data?.student?.matricula||d.data?.student?.folio||options.student?.matricula||options.student?.accountFolio||options.student?.folio||'alumno')+'.pdf';}const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:mime})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),600000);return {url,name};}


// Opt-in short-lived view cache. Identity, grades, payments and document authorization stay fresh.
export async function campusMaterials(blocked=false,fresh=false){
 const epoch=authEpoch,enrollment=activeEnrollment(),key=JSON.stringify([epoch,session,enrollment,blocked]);
 const data=await materialsCache.get(key,async()=>{
  const h=demo?null:await health();
  if(h?.features?.includes('student_hub_batch'))return portalAPI('v35_student_hub');
  const results=await Promise.allSettled([blocked?Promise.resolve({lessons:[]}):portalAPI('lessons'),blocked?Promise.resolve({tasks:[]}):portalAPI('tasks'),portalAPI('calendar')]);
  const value=(i:number)=>results[i].status==='fulfilled'?results[i].value:{};
  return {lessons:value(0).lessons||[],tasks:value(1).tasks||[],events:value(2).events||[],partial:results.some(r=>r.status==='rejected')};
 },fresh);
 if(epoch!==authEpoch||enrollment!==activeEnrollment())throw Object.assign(Error('La cuenta o el curso cambió. Vuelve a consultar.'),{status:409});
 return data;
}
