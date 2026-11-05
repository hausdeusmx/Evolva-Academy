/** Evolva Academy · Registro POST y configuración, versión 5.
 * Instalar este archivo junto con PortalPages.gs, AdminPages.gs y ExpedienteTareas.gs.
 * Las propiedades y los datos de la hoja permanecen en la cuenta de Google.
 */
function configurarDesdeHojaActiva(){
 var ss=SpreadsheetApp.getActiveSpreadsheet();
 if(!ss)throw Error('Abre este proyecto desde Extensiones > Apps Script de la hoja de Evolva.');
 PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID',ss.getId());
 return configurarPortalPages();
}
function portalPrepareRegistration_(){
 var p=PropertiesService.getScriptProperties();
 if(!p.getProperty('PORTAL_SETUP_OWNER_EMAIL')){var owner=Session.getEffectiveUser().getEmail();if(owner)p.setProperty('PORTAL_SETUP_OWNER_EMAIL',String(owner).toLowerCase());}
 if(!p.getProperty('PORTAL_PUBLIC_URL'))p.setProperty('PORTAL_PUBLIC_URL','https://evolvacademy.mx/campus');
 if(!p.getProperty('PORTAL_PASSWORD_PEPPER'))p.setProperty('PORTAL_PASSWORD_PEPPER',Utilities.getUuid()+Utilities.getUuid());
}
function diagnosticarConexion(){
 var p=PropertiesService.getScriptProperties(),id=p.getProperty('SPREADSHEET_ID');
 if(!id)throw Error('Ejecuta configurarDesdeHojaActiva o configura SPREADSHEET_ID.');
 var ss=SpreadsheetApp.openById(id),names=['ALUMNOS','EVALUACIONES','EXAMENES','AVISOS','PAGOS','CONSTANCIAS','_PORTAL_SESIONES','_PORTAL_REPORTES','_PORTAL_LECTURAS','_PORTAL_ADMINISTRADORES','_PORTAL_AUDITORIA','_PORTAL_DOCUMENTOS','_PORTAL_TAREAS','_PORTAL_TAREA_ALUMNOS','_PORTAL_ENTREGAS'];
 return {ok:true,version:5,academicConfigured:portalAcademicReady_(),registrationConfigured:!!(p.getProperty('PORTAL_TURNSTILE_SECRET')||p.getProperty('TURNSTILE_SECRET')),sheets:names.map(function(n){var sh=ss.getSheetByName(n);return {name:n,exists:!!sh,columns:sh?portalHeaders_(sh):[],records:sh?Math.max(0,sh.getLastRow()-1):0};})};
}
function portalPassword_(password,salt){
 var pepper=PropertiesService.getScriptProperties().getProperty('PORTAL_PASSWORD_PEPPER');
 if(!pepper)throw Error('La administración debe ejecutar configurarPortalPages.');
 var bytes=Utilities.computeHmacSha256Signature(String(salt)+'\n'+String(password),pepper);
 return bytes.map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');
}
function portalNewPassword_(password){var salt=Utilities.getUuid().replace(/-/g,'');return 'EAP3$'+salt+'$'+portalPassword_(password,salt);}
function portalCheckPassword_(password,stored){
 var s=String(stored||'');
 if(s.indexOf('EAP3$')!==0)return portalEqual_(String(password),s);
 var parts=s.split('$');if(parts.length!==3||!/^[a-f0-9]{32}$/.test(parts[1])||!/^[a-f0-9]{64}$/.test(parts[2]))return false;
 return portalEqual_(portalPassword_(password,parts[1]),parts[2]);
}
function portalTurnstile_(token){
 var p=PropertiesService.getScriptProperties(),secret=p.getProperty('PORTAL_TURNSTILE_SECRET')||p.getProperty('TURNSTILE_SECRET');
 if(!secret)throw Error('El registro está pendiente de activación por administración.');
 if(!token||String(token).length>2048)throw Error('Completa la verificación de seguridad.');
 var result=UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'post',payload:{secret:secret,response:String(token)},muteHttpExceptions:true});
 var data;try{data=JSON.parse(result.getContentText());}catch(e){throw Error('No fue posible verificar la solicitud. Intenta nuevamente.');}
 var origin=String(p.getProperty('PORTAL_PUBLIC_URL')||''),match=origin.match(/^https:\/\/([^/:?#]+)/i);
 if(result.getResponseCode()!==200||!data.success||!match||String(data.hostname||'').toLowerCase()!==match[1].toLowerCase())throw Error('La verificación de seguridad no es válida o expiró. Complétala nuevamente.');
}
function portalEnsureRegistrationColumns_(sh){
 var required=['MODALIDAD_PAGO','TOTAL_CURSO','NUM_CUOTAS','MONTO_CUOTA','DURACION_SEMANAS','PRECIO_SEMANAL','PRECIO_MENSUAL'];
 var headers=portalHeaders_(sh);
 required.forEach(function(name){if(headers.indexOf(name)<0){var col=headers.length+1;sh.getRange(1,col).setValue(name);headers.push(name);}});
 return headers;
}
function portalCoursePayment_(course){
 var map={
  'Finanzas Personales':{weeks:8,weekly:100,monthly:400,total:800},
  'Primeros Auxilios':{weeks:8,weekly:150,monthly:600,total:1200},
  'Excel básico para el trabajo':{weeks:8,weekly:100,monthly:400,total:800},
  'Canva para redes y negocios':{weeks:6,weekly:100,monthly:400,total:600},
  'Atención al cliente y ventas':{weeks:6,weekly:100,monthly:400,total:600},
  'Administración de pequeños negocios':{weeks:8,weekly:125,monthly:500,total:1000},
  'Marketing digital básico':{weeks:8,weekly:150,monthly:600,total:1200}
 };
 return map[course]||null;
}
function portalRegister_(ss,b){
 var name=String(b.nombre||'').trim(),email=String(b.email||'').trim().toLowerCase(),curp=String(b.curp||'').trim().toUpperCase(),age=Number(b.edad),state=String(b.estado||'').trim(),birth=String(b.fecha||''),course=String(b.diplomado||'').trim(),paymentMode=String(b.paymentMode||'weekly').trim().toLowerCase();
 if(name.length<2||name.length>160||!/^\S+@\S+\.\S+$/.test(email)||email.length>160||!/^[A-Z0-9]{18}$/.test(curp)||!Number.isInteger(age)||age<15||age>100||!state||state.length>80||!/^\d{4}-\d{2}-\d{2}$/.test(birth)||['Finanzas Personales','Primeros Auxilios','Excel básico para el trabajo','Canva para redes y negocios','Atención al cliente y ventas','Administración de pequeños negocios','Marketing digital básico'].indexOf(course)<0||['weekly','monthly','total'].indexOf(paymentMode)<0)throw Error('Revisa los datos del formulario.');
 var born=new Date(birth+'T12:00:00Z');if(!isFinite(born.getTime())||born.toISOString().slice(0,10)!==birth||born.getTime()>Date.now())throw Error('Revisa la fecha de nacimiento.');
 var admins=String(PropertiesService.getScriptProperties().getProperty('PORTAL_ADMIN_EMAILS')||'').toLowerCase().split(',').map(function(x){return x.trim();});
 if(admins.indexOf(email)>=0||portalRows_(ss,'_PORTAL_ADMINISTRADORES').some(function(r){return String(r.EMAIL||'').trim().toLowerCase()===email;}))throw Error('Solicita a administración el alta de esta cuenta.');
 var cache=CacheService.getScriptCache(),key='register:'+portalHash_(email),count=Number(cache.get(key)||0)+1;cache.put(key,String(count),3600);if(count>6)portalFail_('Demasiados intentos. Intenta nuevamente más tarde.',429);
 portalTurnstile_(b.turnstileToken);
 if(!portalAcademicReady_())throw Error('La inscripción con documentos está pendiente de activación.');
 var requestId=portalRequestId_(b.requestId),curpDocument=portalUpload_(b.curpFile,'curp'),photoDocument=portalUpload_(b.photoFile,'photo');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var existing=portalRows_(ss,'ALUMNOS');
  if(existing.some(function(a){return [a.CORREO_PERSONAL,a.CORREO_INSTITUCIONAL].some(function(v){return String(v||'').trim().toLowerCase()===email;})||String(a.CURP||'').trim().toUpperCase()===curp;}))throw Error('Ya existe un registro con esos datos. Solicita ayuda a administración; no vuelvas a inscribirte.');
  var used={};['ALUMNOS','EVALUACIONES','EXAMENES','PAGOS','CONSTANCIAS','_PORTAL_SESIONES','_PORTAL_REPORTES'].forEach(function(n){portalRows_(ss,n).forEach(function(r){used[String(r.FOLIO||'').trim().toUpperCase()]=true;});});
  var folio='';for(var i=0;i<20;i++){var number=parseInt(Utilities.getUuid().replace(/-/g,'').slice(0,8),16)%999999+1,candidate='EVOLVA-'+('000000'+number).slice(-6);if(!used[candidate]){folio=candidate;break;}}
  if(!folio)throw Error('No fue posible asignar un folio. Contacta a administración.');
  var password=Utilities.getUuid().replace(/-/g,'').slice(0,16),now=new Date(),safe=function(v){var s=String(v);return /^[=+@-]/.test(s)?"'"+s:s;},pricing=portalCoursePayment_(course);if(!pricing)throw Error('El curso no tiene un plan de pago configurado.');var installments=paymentMode==='weekly'?pricing.weeks:paymentMode==='monthly'?Math.ceil(pricing.weeks/4):1,installmentAmount=paymentMode==='weekly'?pricing.weekly:paymentMode==='monthly'?pricing.monthly:pricing.total;
  var obj={ID:Utilities.getUuid(),FOLIO:folio,NOMBRE:safe(name),CORREO_PERSONAL:email,CORREO_INSTITUCIONAL:'',CURP:curp,DIPLOMADO:course,'CONTRASEÑA':portalNewPassword_(password),ESTADO:'REGISTRADO',PAGO:'PENDIENTE',AVANCE:0,PROMEDIO:'',M1:'',M2:'',M3:'',M4:'',GRUPO:'',EDAD:age,ESTADO_RESIDENCIA:safe(state),FECHA_NACIMIENTO:birth,FECHA_REGISTRO:now,MODALIDAD_PAGO:paymentMode,TOTAL_CURSO:pricing.total,NUM_CUOTAS:installments,MONTO_CUOTA:installmentAmount,DURACION_SEMANAS:pricing.weeks,PRECIO_SEMANAL:pricing.weekly,PRECIO_MENSUAL:pricing.monthly};
  var sh=ss.getSheetByName('ALUMNOS'),headers=portalEnsureRegistrationColumns_(sh),documents;
  try{documents=portalRegistrationDocuments_(ss,folio,requestId,curpDocument,photoDocument);sh.appendRow(headers.map(function(h){return obj[h]===undefined?'':obj[h];}));}
  catch(err){if(documents){portalDeleteNewRows_(ss,'_PORTAL_DOCUMENTOS',documents.ids);portalDeleteNewRows_(ss,'ALUMNOS',[obj.ID]);documents.files.forEach(function(file){file.setTrashed(true);});}throw err;}
  cache.remove(key);return {ok:true,folio:folio,matricula:folio,password:password,alumno:{CORREO_PERSONAL:email}};
 }finally{lock.releaseLock();}
}
