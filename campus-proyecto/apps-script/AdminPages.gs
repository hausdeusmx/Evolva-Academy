/** Evolva Academy · Administración académica. Nunca enviar hashes al navegador. */
function portalRequireAdmin_(auth){if(!auth||auth.role!=='admin')portalFail_('Esta operación requiere una cuenta administrativa.',403);}
function portalAdminRecord_(ss,email){var rows=portalRows_(ss,'_PORTAL_ADMINISTRADORES').filter(function(r){return String(r.EMAIL||'').trim().toLowerCase()===email;});if(rows.length!==1||portalText_(rows[0].ESTADO)!=='ACTIVO'||!rows[0].HASH)portalFail_('Correo o contraseña incorrectos.',401);return rows[0];}
function portalAdminLogin_(ss,b){
 var email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');
 if(!email||email.length>254||!password||password.length>200)portalFail_('Correo o contraseña incorrectos.',401);
 var cache=CacheService.getScriptCache(),key='admin-login:'+portalHash_(email),lock=LockService.getScriptLock();lock.waitLock(10000);
 try{var count=Number(cache.get(key)||0)+1;cache.put(key,String(count),900);if(count>8)portalFail_('Demasiados intentos. Intenta nuevamente en 15 minutos.',429);}finally{lock.releaseLock();}
 var admin=portalAdminRecord_(ss,email);if(!portalCheckPassword_(password,admin.HASH))portalFail_('Correo o contraseña incorrectos.',401);
 var token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''),now=Date.now();
 lock.waitLock(10000);try{ss.getSheetByName('_PORTAL_SESIONES').appendRow([portalHash_(token),'@ADMIN',email,new Date(now+8*60*60*1000),new Date(now)]);}finally{lock.releaseLock();}
 cache.remove(key);return {ok:true,session:token,admin:{name:String(admin.NOMBRE||'Administración'),email:email}};
}
function portalAdminProfile_(a){return {name:String(a.NOMBRE||'Administración'),email:String(a.EMAIL||'')};}
function portalAdminStudent_(ss,folio){var a=portalFindAlumno_(ss,folio),d=portalDashboard_(ss,a),rows=portalRows_(ss,'EVALUACIONES').filter(function(r){return portalOwn_(r,a);});return {ok:true,student:d.student,average:d.average,progress:d.progress,grades:d.grades.map(function(g){var r=rows.filter(function(r){return portalGradeId_(r)===g.id;})[0];g.revision=r?portalGradeRevision_(r):portalLegacyGradeRevision_(a);return g;}),exams:d.exams};}
function portalLegacyGradeRevision_(a){return 'LEGACY-'+portalHash_(JSON.stringify([a.FOLIO,a.DIPLOMADO,a.M1,a.M2,a.M3,a.M4]));}
function portalPreserveLegacyGrades_(ss,a){
 if(portalRows_(ss,'EVALUACIONES').some(function(r){return portalOwn_(r,a);}))return;
 // Keep the four previously visible modules when this student first uses detailed evaluations.
 var headers=portalHeaders_(ss.getSheetByName('EVALUACIONES')),folio=String(a.FOLIO).trim().toUpperCase(),rows=['M1','M2','M3','M4'].map(function(k){var score=portalNumber_(a[k]),obj={ID:k,FOLIO:folio,DIPLOMADO:a.DIPLOMADO,MODULO:k,CLAVE:k,EVALUACION:'Módulo '+k.slice(1),CALIFICACION:score===null?'':score,CALIFICACIONES:score===null?'':score,ESTADO:score===null?'Pendiente':'Evaluado',FECHA:new Date()};return headers.map(function(h){return obj[h]===undefined?'':obj[h];});}),sh=ss.getSheetByName('EVALUACIONES');
 sh.getRange(sh.getLastRow()+1,1,rows.length,headers.length).setValues(rows);
}
function portalGradeId_(r){return String(r.ID||r.CLAVE||'ROW-'+r._row);}
function portalGradeRevision_(r){return portalHash_(JSON.stringify([r.FOLIO,r.DIPLOMADO,r.MODULO,r.CLAVE,r.EVALUACION,r.CALIFICACION,r.CALIFICACIONES,r.ESTADO]));}
function portalSafeCell_(v){var s=String(v);return /^\s*[=+@-]/.test(s)?"'"+s:s;}
function portalPutRow_(ss,name,row,obj){
 var sh=ss.getSheetByName(name);if(!sh)throw Error('Ejecuta configurarPortalPages antes de continuar.');var headers=portalHeaders_(sh),values=headers.map(function(){return '';});
 if(row){var range=sh.getRange(row,1,1,headers.length),old=range.getValues()[0],formulas=range.getFormulas()[0];values=old.map(function(v,i){return formulas[i]||v;});}
 headers.forEach(function(h,i){if(Object.prototype.hasOwnProperty.call(obj,h))values[i]=obj[h];});
 if(row)sh.getRange(row,1,1,headers.length).setValues([values]);else sh.appendRow(values);
}
function portalAudit_(ss,auth,action,folio,reference,before,after){ss.getSheetByName('_PORTAL_AUDITORIA').appendRow([Utilities.getUuid(),auth.email,action,folio,reference,JSON.stringify(before||{}),JSON.stringify(after||{}),new Date()]);}
function portalAdminAction_(ss,auth,b){
 portalRequireAdmin_(auth);var action=String(b.action||'');
 if(action==='admin_session')return {ok:true,admin:portalAdminProfile_(auth.record)};
 if(action==='admin_students'){
  var q=String(b.query||'').trim().toLowerCase().slice(0,120),offset=Math.max(0,Math.floor(Number(b.offset)||0)),all=portalRows_(ss,'ALUMNOS').filter(function(a){return /^EVOLVA-\d{6}$/.test(String(a.FOLIO||'').trim().toUpperCase());});
  var filtered=all.filter(function(a){return !q||[a.FOLIO,a.NOMBRE,a.CORREO_PERSONAL,a.DIPLOMADO,a.GRUPO].some(function(v){return String(v||'').toLowerCase().indexOf(q)>=0;});});
  return {ok:true,total:filtered.length,students:filtered.slice(offset,offset+40).map(portalStudent_),courses:all.map(function(a){return String(a.DIPLOMADO||'');}).filter(function(v,i,a){return v&&a.indexOf(v)===i;}),groups:all.map(function(a){return {course:String(a.DIPLOMADO||''),group:String(a.GRUPO||'')};}).filter(function(v,i,a){return v.group&&a.findIndex(function(x){return x.course===v.course&&x.group===v.group;})===i;})};
 }
 if(action==='admin_student')return portalAdminStudent_(ss,String(b.folio||'').trim().toUpperCase());
 if(action==='admin_save_grade')return portalAdminSaveGrade_(ss,auth,b);
 if(action==='admin_exam_preview'){var targets=portalExamRecipients_(ss,b);return {ok:true,count:targets.length,fingerprint:portalRecipientsHash_(targets)};}
 if(action==='admin_publish_exam')return portalAdminPublishExam_(ss,auth,b);
 throw Error('Acción administrativa no disponible.');
}
function portalAdminSaveGrade_(ss,auth,b){
 var folio=String(b.folio||'').trim().toUpperCase(),id=String(b.id||''),title=String(b.title||'').trim(),module=String(b.module||'').trim(),score=b.score===null||b.score===''?null:Number(b.score),status=String(b.status||(score===null?'Pendiente':'Calificado')).trim();
 if(!/^EVOLVA-\d{6}$/.test(folio)||id.length>100||!title||title.length>180||!module||module.length>40||status.length>40||(score!==null&&(!Number.isFinite(score)||score<0||score>10)))throw Error('Revisa la evaluación y usa una calificación de 0 a 10.');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var a=portalFindAlumno_(ss,folio),rows=portalRows_(ss,'EVALUACIONES').filter(function(r){return portalOwn_(r,a);}),legacy=rows.length===0&&/^M[1-4]$/.test(id);
  if(legacy&&String(b.revision||'')!==portalLegacyGradeRevision_(a))portalFail_('La evaluación cambió desde que la abriste. Actualiza antes de guardar.',409);
  if(!rows.length){portalPreserveLegacyGrades_(ss,a);rows=portalRows_(ss,'EVALUACIONES').filter(function(r){return portalOwn_(r,a);});}
  var matches=rows.filter(function(r){return portalGradeId_(r)===id;});
  if(matches.length>1)throw Error('La evaluación tiene identificadores duplicados. Revisa la hoja.');var old=matches[0];
  if(old&&!legacy&&String(b.revision||'')!==portalGradeRevision_(old))portalFail_('La evaluación cambió desde que la abriste. Actualiza antes de guardar.',409);
  var key=old?String(old.ID||old.CLAVE||''):id;if(!key||/^ROW-/.test(key))key=Utilities.getUuid();
  var update={ID:key,FOLIO:folio,DIPLOMADO:a.DIPLOMADO,MODULO:portalSafeCell_(module),EVALUACION:portalSafeCell_(title),CALIFICACION:score===null?'':score,CALIFICACIONES:score===null?'':score,ESTADO:portalSafeCell_(status),FECHA:new Date()};
  portalPutRow_(ss,'EVALUACIONES',old?old._row:0,update);
  portalAudit_(ss,auth,'CALIFICACION',folio,key,old?{title:old.EVALUACION,score:old.CALIFICACION!==undefined?old.CALIFICACION:old.CALIFICACIONES}:null,{title:title,module:module,score:score,status:status});
  return portalAdminStudent_(ss,folio);
 }finally{lock.releaseLock();}
}
function portalExamRecipients_(ss,b){
 var scope=String(b.scope||''),folio=String(b.folio||'').trim().toUpperCase(),course=String(b.course||''),group=String(b.group||'');
 if(['student','course','group'].indexOf(scope)<0||(scope==='student'&&!/^EVOLVA-\d{6}$/.test(folio))||(scope!=='student'&&!course)||(scope==='group'&&!group))throw Error('Selecciona los destinatarios del examen.');
 var targets=portalRows_(ss,'ALUMNOS').filter(function(a){return /^EVOLVA-\d{6}$/.test(String(a.FOLIO||'').trim().toUpperCase())&&['BAJA','INACTIVO','SUSPENDIDO','CANCELADO'].indexOf(portalText_(a.ESTADO))<0&&(scope==='student'?String(a.FOLIO).trim().toUpperCase()===folio:portalText_(a.DIPLOMADO)===portalText_(course)&&(scope!=='group'||String(a.GRUPO||'')===group));});
 if(!targets.length)throw Error('No hay alumnos activos en esa selección.');if(targets.length>200)throw Error('Publica por grupos de hasta 200 alumnos.');
 var seen={};targets.forEach(function(a){var f=String(a.FOLIO).trim().toUpperCase();if(seen[f])throw Error('Hay folios duplicados en la selección. Revisa la base.');seen[f]=true;});return targets;
}
function portalRecipientsHash_(targets){return portalHash_(targets.map(function(a){return String(a.FOLIO).trim().toUpperCase();}).sort().join('|'));}
function portalAdminPublishExam_(ss,auth,b){
 var title=String(b.title||'').trim(),module=String(b.module||'').trim(),url=String(b.url||'').trim(),duration=Number(b.duration)||10,requestId=String(b.requestId||'');
 if(!title||title.length>180||!module||module.length>40||!/^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:[\/?#][^\s]*)?$/.test(url)||url.length>1500||!Number.isInteger(duration)||duration<1||duration>600||!/^[a-f0-9-]{36}$/.test(requestId))throw Error('Revisa el título, módulo, duración y enlace HTTPS del examen.');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var targets=portalExamRecipients_(ss,b);if(String(b.fingerprint||'')!==portalRecipientsHash_(targets))portalFail_('La selección de alumnos cambió. Revisa los destinatarios otra vez.',409);
  var ex=portalRows_(ss,'EXAMENES'),grades=portalRows_(ss,'EVALUACIONES'),created=0;
  targets.forEach(function(a){portalPreserveLegacyGrades_(ss,a);var folio=String(a.FOLIO).trim().toUpperCase(),id='EX-'+requestId+'-'+folio;
   if(!ex.some(function(r){return String(r.ID)===id&&String(r.FOLIO).trim().toUpperCase()===folio;})){portalPutRow_(ss,'EXAMENES',0,{ID:id,FOLIO:folio,DIPLOMADO:a.DIPLOMADO,EXAMEN:portalSafeCell_(title),MODULO:portalSafeCell_(module),URL:url,DURACION:duration,CALIFICACION:'',ESTADO:'Disponible'});created++;}
   if(!grades.some(function(r){return String(r.ID)===id&&String(r.FOLIO).trim().toUpperCase()===folio;}))portalPutRow_(ss,'EVALUACIONES',0,{ID:id,FOLIO:folio,DIPLOMADO:a.DIPLOMADO,MODULO:portalSafeCell_(module),CLAVE:id,EVALUACION:portalSafeCell_(title),CALIFICACIONES:'',CALIFICACION:'',ESTADO:'Pendiente',FECHA:new Date()});
  });
  portalAudit_(ss,auth,'PUBLICAR_EXAMEN','',requestId,null,{title:title,module:module,recipients:targets.length,created:created});return {ok:true,count:targets.length,created:created};
 }finally{lock.releaseLock();}
}
function portalSetupOwner_(){var p=PropertiesService.getScriptProperties(),expected=String(p.getProperty('PORTAL_SETUP_OWNER_EMAIL')||'').toLowerCase(),actor=String(Session.getActiveUser().getEmail()||'').toLowerCase();if(!expected||actor!==expected)throw Error('Esta activación debe realizarla el propietario desde la hoja de Evolva.');return actor;}
function configurarAdministradorEvolva(){
 portalSetupOwner_();var html='<!doctype html><html lang="es"><meta charset="utf-8"><style>body{font:14px Arial;padding:24px;color:#36242a}input,button{box-sizing:border-box;width:100%;padding:12px;margin:10px 0}button{background:#500c17;color:white;border:0;border-radius:5px}#error{color:#8d2943}</style><h2>Activar administración de Evolva</h2><p>Crea una contraseña de al menos 12 caracteres para tu cuenta propietaria. Se guardará como hash privado.</p><form id="form"><label>Contraseña nueva<input id="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required></label><label>Confirmar contraseña<input id="confirm" type="password" autocomplete="new-password" minlength="12" required></label><button id="save">Activar mi cuenta</button><p id="error" role="alert"></p></form><script>document.getElementById("form").onsubmit=function(e){e.preventDefault();var a=document.getElementById("password"),b=document.getElementById("confirm"),error=document.getElementById("error");if(a.value!==b.value){error.textContent="Las contraseñas no coinciden.";return;}document.getElementById("save").disabled=true;google.script.run.withSuccessHandler(function(){a.value="";b.value="";document.getElementById("form").textContent="Cuenta activada. Ya puedes entrar en el acceso administrativo del campus.";}).withFailureHandler(function(err){error.textContent=err.message;document.getElementById("save").disabled=false;}).activarAdministradorEvolva(a.value);};</script></html>';
 SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(470).setHeight(490),'Administración de Evolva');
}
function activarAdministradorEvolva(password){
 var email=portalSetupOwner_();if(String(password||'').length<12||String(password).length>128)throw Error('Usa una contraseña de 12 a 128 caracteres.');
 var ss=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')),lock=LockService.getScriptLock();lock.waitLock(10000);
 try{var rows=portalRows_(ss,'_PORTAL_ADMINISTRADORES').filter(function(r){return String(r.EMAIL||'').toLowerCase()===email;});if(rows.length>1||rows.some(function(r){return !!r.HASH;}))throw Error('La cuenta ya está activada o requiere revisión. No se cambió su contraseña.');portalPutRow_(ss,'_PORTAL_ADMINISTRADORES',rows[0]?rows[0]._row:0,{EMAIL:email,NOMBRE:rows[0]?rows[0].NOMBRE:'Administración de Evolva',HASH:portalNewPassword_(String(password)),ESTADO:'ACTIVO',CREADO:rows[0]?rows[0].CREADO:new Date(),ACTUALIZADO:new Date()});return {ok:true};}finally{lock.releaseLock();}
}
