/** Evolva Academy v5 · Expedientes privados, credenciales y tareas. */
var PORTAL_ACADEMIC_TABLES={
 _PORTAL_DOCUMENTOS:['ID','FOLIO','TIPO','NOMBRE','MIME','TAMANO','ARCHIVO','FECHA','SOLICITUD'],
 _PORTAL_TAREAS:['ID','TITULO','DESCRIPCION','MODULO','FECHA_LIMITE','CREADO','CREADO_POR','ESTADO','ARCHIVO','NOMBRE','MIME','TAMANO'],
 _PORTAL_TAREA_ALUMNOS:['TAREA_ID','FOLIO','FECHA'],
 _PORTAL_ENTREGAS:['ID','TAREA_ID','FOLIO','COMENTARIO','ARCHIVO','NOMBRE','MIME','TAMANO','FECHA','ESTADO','CALIFICACION','RETROALIMENTACION','REVISADO','REVISADO_POR','SOLICITUD']
};
function portalPrepareAcademics_(ss){
 Object.keys(PORTAL_ACADEMIC_TABLES).forEach(function(name){
  var sh=ss.getSheetByName(name);if(!sh){sh=ss.insertSheet(name);sh.appendRow(PORTAL_ACADEMIC_TABLES[name]);}
  else if(portalHeaders_(sh).join('|')!==PORTAL_ACADEMIC_TABLES[name].join('|'))throw Error('Revisa las columnas de '+name+'. Se conservaron sus registros.');
  if(sh.setFrozenRows)sh.setFrozenRows(1);if(sh.hideSheet)sh.hideSheet();
 });
 PropertiesService.getScriptProperties().setProperty('PORTAL_ACADEMICS_READY','5');
}
function portalAcademicReady_(){return PropertiesService.getScriptProperties().getProperty('PORTAL_ACADEMICS_READY')==='5';}
function portalISO_(value){var date=new Date(value);return isFinite(date.getTime())?date.toISOString():'';}
function portalRequestId_(value){var id=String(value||'');if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))throw Error('Actualiza la página antes de enviar el archivo.');return id.toLowerCase();}
function portalStudentAuth_(auth){if(!auth||!auth.alumno||auth.role==='admin')portalFail_('Esta operación requiere una cuenta de alumno.',403);return auth.alumno;}
function portalUpload_(input,kind){
 if(!input||!input.base64)throw Error(kind==='curp'?'Adjunta tu CURP en PDF.':kind==='photo'?'Adjunta tu fotografía con fondo blanco.':'Selecciona un archivo para enviar.');
 var bytes;try{bytes=Utilities.base64Decode(String(input.base64));}catch(e){throw Error('No se pudo leer el archivo.');}
 var limit=kind==='photo'?1024*1024:2*1024*1024;
 if(!bytes.length||bytes.length>limit)throw Error(kind==='photo'?'La fotografía debe pesar hasta 1 MB.':'El archivo debe pesar hasta 2 MB.');
 var v=bytes.slice(0,8).map(function(b){return (b+256)%256;}),mime=String(input.mime||''),name=String(input.name||'archivo').replace(/[\\/\x00-\x1f]/g,'_').slice(0,160),extension=name.split('.').pop().toLowerCase();
 var pdf=v.slice(0,5).map(function(x){return String.fromCharCode(x);}).join('')==='%PDF-',png=v.join(',')==='137,80,78,71,13,10,26,10',jpg=v[0]===255&&v[1]===216&&v[2]===255,zip=v[0]===80&&v[1]===75&&v[2]===3&&v[3]===4;
 var allowed=pdf&&mime==='application/pdf'&&extension==='pdf'||png&&mime==='image/png'&&extension==='png'||jpg&&mime==='image/jpeg'&&['jpg','jpeg'].indexOf(extension)>=0;
 if(kind==='curp')allowed=pdf&&mime==='application/pdf'&&extension==='pdf';
 if(kind==='photo')allowed=png&&mime==='image/png'&&extension==='png'||jpg&&mime==='image/jpeg'&&['jpg','jpeg'].indexOf(extension)>=0;
 if(kind==='work')allowed=allowed||zip&&((extension==='docx'&&mime==='application/vnd.openxmlformats-officedocument.wordprocessingml.document')||(extension==='pptx'&&mime==='application/vnd.openxmlformats-officedocument.presentationml.presentation'));
 if(!allowed)throw Error(kind==='curp'?'El documento CURP debe ser un PDF válido.':kind==='photo'?'La fotografía debe ser JPG o PNG.':'Usa PDF, DOCX, PPTX, JPG o PNG; el contenido debe coincidir con el tipo de archivo.');
 return {bytes:bytes,mime:mime,name:name,size:bytes.length};
}
function portalPrivateFolder_(purpose){
 var p=PropertiesService.getScriptProperties(),key=purpose==='documents'?'PORTAL_DOCUMENTS_FOLDER_ID':'PORTAL_ASSIGNMENTS_FOLDER_ID',id=p.getProperty(key);
 if(id)return DriveApp.getFolderById(id);
 var folder=DriveApp.createFolder(purpose==='documents'?'Evolva Campus - Expedientes privados':'Evolva Campus - Tareas privadas');p.setProperty(key,folder.getId());return folder;
}
function portalStoreFile_(file,purpose,prefix){return portalPrivateFolder_(purpose).createFile(Utilities.newBlob(file.bytes,file.mime,prefix+'-'+file.name));}
function portalPrivateFile_(id){
 var file=DriveApp.getFileById(String(id));if(file.getSize()>2*1024*1024)throw Error('El archivo excede el límite de descarga.');
 var blob=file.getBlob();return {ok:true,name:file.getName(),mime:blob.getContentType(),base64:Utilities.base64Encode(blob.getBytes())};
}
function portalDeleteNewRows_(ss,name,ids){var sh=ss.getSheetByName(name),rows=portalRows_(ss,name);for(var i=rows.length-1;i>=0;i--)if(ids.indexOf(String(rows[i].ID))>=0)sh.deleteRow(rows[i]._row);}
function portalDocumentDTO_(r){return {id:String(r.ID),type:String(r.TIPO),name:String(r.NOMBRE),mime:String(r.MIME),size:Number(r.TAMANO)||0,created:portalISO_(r.FECHA)};}
function portalDocuments_(ss,folio){return portalRows_(ss,'_PORTAL_DOCUMENTOS').filter(function(r){return String(r.FOLIO)===folio;}).sort(function(a,b){return new Date(b.FECHA)-new Date(a.FECHA)||b._row-a._row;});}
function portalRegistrationDocuments_(ss,folio,requestId,curp,photo){
 var files=[],ids=['DOC-'+requestId+'-CURP','DOC-'+requestId+'-FOTO'];
 try{
  [{kind:'CURP',data:curp},{kind:'FOTOGRAFIA',data:photo}].forEach(function(item,index){var file=portalStoreFile_(item.data,'documents',folio+'-'+item.kind);files.push(file);portalPutRow_(ss,'_PORTAL_DOCUMENTOS',0,{ID:ids[index],FOLIO:folio,TIPO:item.kind,NOMBRE:portalSafeCell_(item.data.name),MIME:item.data.mime,TAMANO:item.data.size,ARCHIVO:file.getId(),FECHA:new Date(),SOLICITUD:requestId});});
  return {files:files,ids:ids};
 }catch(e){portalDeleteNewRows_(ss,'_PORTAL_DOCUMENTOS',ids);files.forEach(function(f){f.setTrashed(true);});throw e;}
}
function portalDocumentArchive_(ss,folio){
 var tasks=portalRows_(ss,'_PORTAL_TAREAS');return {ok:true,documents:portalDocuments_(ss,folio).map(portalDocumentDTO_),deliveries:portalRows_(ss,'_PORTAL_ENTREGAS').filter(function(r){return String(r.FOLIO)===folio;}).sort(function(a,b){return new Date(b.FECHA)-new Date(a.FECHA)||b._row-a._row;}).map(function(r){var t=tasks.filter(function(t){return String(t.ID)===String(r.TAREA_ID);})[0],d=portalSubmissionDTO_(r);d.taskTitle=t?String(t.TITULO):'Trabajo entregado';return d;})};
}
function portalUploadDocument_(ss,a,b){
 var type=String(b.type||''),requestId=portalRequestId_(b.requestId);if(['CURP','FOTOGRAFIA','OTRO'].indexOf(type)<0)throw Error('Selecciona el tipo de documento.');
 var input=portalUpload_(b.file,type==='CURP'?'curp':type==='FOTOGRAFIA'?'photo':'work'),folio=String(a.FOLIO).trim().toUpperCase(),id='DOC-'+requestId,lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var previous=portalDocuments_(ss,folio).filter(function(r){return r.ID===id;})[0];if(previous)return {ok:true,documents:portalDocuments_(ss,folio).map(portalDocumentDTO_)};
  var file=portalStoreFile_(input,'documents',folio+'-'+type);
  try{portalPutRow_(ss,'_PORTAL_DOCUMENTOS',0,{ID:id,FOLIO:folio,TIPO:type,NOMBRE:portalSafeCell_(input.name),MIME:input.mime,TAMANO:input.size,ARCHIVO:file.getId(),FECHA:new Date(),SOLICITUD:requestId});}catch(e){file.setTrashed(true);throw e;}
  return {ok:true,documents:portalDocuments_(ss,folio).map(portalDocumentDTO_)};
 }finally{lock.releaseLock();}
}
function portalTask_(ss,id){var rows=portalRows_(ss,'_PORTAL_TAREAS').filter(function(r){return String(r.ID)===String(id);});if(rows.length!==1)portalFail_('La tarea no está disponible.',404);return rows[0];}
function portalTaskAssigned_(ss,id,folio){return portalRows_(ss,'_PORTAL_TAREA_ALUMNOS').some(function(r){return String(r.TAREA_ID)===String(id)&&String(r.FOLIO)===folio;});}
function portalRequireTask_(ss,id,folio){var task=portalTask_(ss,id);if(!portalTaskAssigned_(ss,id,folio))portalFail_('La tarea no está disponible para tu cuenta.',404);return task;}
function portalTaskGradeId_(id){return 'TAR-'+id;}
function portalLatestSubmission_(ss,id,folio){return portalRows_(ss,'_PORTAL_ENTREGAS').filter(function(r){return String(r.TAREA_ID)===String(id)&&String(r.FOLIO)===folio;}).sort(function(a,b){return new Date(b.FECHA)-new Date(a.FECHA)||b._row-a._row;})[0]||null;}
function portalSubmissionRevision_(r){return portalHash_(JSON.stringify([r.ID,r.ESTADO,r.CALIFICACION,r.RETROALIMENTACION,r.REVISADO]));}
function portalSubmissionDTO_(r){return r?{id:String(r.ID),name:String(r.NOMBRE),mime:String(r.MIME),size:Number(r.TAMANO)||0,comment:String(r.COMENTARIO||''),created:portalISO_(r.FECHA),status:String(r.ESTADO),score:portalNumber_(r.CALIFICACION),feedback:String(r.RETROALIMENTACION||''),reviewedAt:portalISO_(r.REVISADO),revision:portalSubmissionRevision_(r)}:null;}
function portalTaskDTO_(ss,r,folio){
 var latest=folio?portalLatestSubmission_(ss,r.ID,folio):null;
 return {id:String(r.ID),title:String(r.TITULO),description:String(r.DESCRIPCION||''),module:String(r.MODULO||''),dueAt:r.FECHA_LIMITE?portalISO_(r.FECHA_LIMITE):'',created:portalISO_(r.CREADO),status:String(r.ESTADO),attachment:r.ARCHIVO?{name:String(r.NOMBRE),mime:String(r.MIME),size:Number(r.TAMANO)||0}:null,submission:portalSubmissionDTO_(latest),late:!!latest&&!!r.FECHA_LIMITE&&new Date(latest.FECHA)>new Date(r.FECHA_LIMITE)};
}
function portalStudentTasks_(ss,a){var folio=String(a.FOLIO).trim().toUpperCase(),ids=portalRows_(ss,'_PORTAL_TAREA_ALUMNOS').filter(function(r){return String(r.FOLIO)===folio;}).map(function(r){return String(r.TAREA_ID);});return {ok:true,tasks:portalRows_(ss,'_PORTAL_TAREAS').filter(function(r){return ids.indexOf(String(r.ID))>=0;}).sort(function(a,b){return new Date(b.CREADO)-new Date(a.CREADO)||b._row-a._row;}).map(function(r){return portalTaskDTO_(ss,r,folio);})};}
function portalTaskPublish_(ss,auth,b){
 portalRequireAdmin_(auth);var requestId=portalRequestId_(b.requestId),id='TA-'+requestId,title=String(b.title||'').trim(),description=String(b.description||'').trim(),module=String(b.module||'').trim(),due=b.dueAt?new Date(b.dueAt):null,input=b.file?portalUpload_(b.file,'work'):null;
 if(!title||title.length>180||!description||description.length>6000||!module||module.length>40||(due&&!isFinite(due.getTime())))throw Error('Completa el título, las instrucciones y el módulo de la tarea.');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var existing=portalRows_(ss,'_PORTAL_TAREAS').filter(function(r){return String(r.ID)===id;})[0];
  var targets=portalExamRecipients_(ss,b);if(String(b.fingerprint||'')!==portalRecipientsHash_(targets))portalFail_('Los destinatarios cambiaron. Revisa la selección otra vez.',409);
  if(existing&&(String(existing.TITULO)!==portalSafeCell_(title)||String(existing.MODULO)!==portalSafeCell_(module)))portalFail_('Esta publicación ya tiene otros datos. Actualiza la lista de tareas.',409);
  var material;
  if(!existing){
   if(input)material=portalStoreFile_(input,'tasks',id);
   try{portalPutRow_(ss,'_PORTAL_TAREAS',0,{ID:id,TITULO:portalSafeCell_(title),DESCRIPCION:portalSafeCell_(description),MODULO:portalSafeCell_(module),FECHA_LIMITE:due||'',CREADO:new Date(),CREADO_POR:auth.email,ESTADO:'PUBLICADA',ARCHIVO:material?material.getId():'',NOMBRE:input?portalSafeCell_(input.name):'',MIME:input?input.mime:'',TAMANO:input?input.size:''});}catch(e){if(material)material.setTrashed(true);throw e;}
  }
  var assignments=portalRows_(ss,'_PORTAL_TAREA_ALUMNOS'),grades=portalRows_(ss,'EVALUACIONES');
  targets.forEach(function(a){var folio=String(a.FOLIO).trim().toUpperCase();portalPreserveLegacyGrades_(ss,a);
   if(!assignments.some(function(r){return String(r.TAREA_ID)===id&&String(r.FOLIO)===folio;}))ss.getSheetByName('_PORTAL_TAREA_ALUMNOS').appendRow([id,folio,new Date()]);
   if(!grades.some(function(r){return String(r.ID)===portalTaskGradeId_(id)&&String(r.FOLIO)===folio;}))portalPutRow_(ss,'EVALUACIONES',0,{ID:portalTaskGradeId_(id),FOLIO:folio,DIPLOMADO:a.DIPLOMADO,MODULO:portalSafeCell_(module),CLAVE:portalTaskGradeId_(id),EVALUACION:portalSafeCell_(title),CALIFICACION:'',CALIFICACIONES:'',ESTADO:'Pendiente',FECHA:new Date()});
  });
  portalAudit_(ss,auth,'PUBLICAR_TAREA','',id,null,{title:title,recipients:targets.length});return {ok:true,id:id,count:targets.length};
 }finally{lock.releaseLock();}
}
function portalSubmitTask_(ss,a,b){
 var requestId=portalRequestId_(b.requestId),id='EN-'+requestId,folio=String(a.FOLIO).trim().toUpperCase(),comment=String(b.comment||'').trim();if(comment.length>3000)throw Error('El comentario debe tener hasta 3000 caracteres.');
 var fileInput=portalUpload_(b.file,'work'),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var task=portalRequireTask_(ss,b.taskId,folio);if(task.ESTADO!=='PUBLICADA')throw Error('Esta tarea ya no recibe entregas.');
  var all=portalRows_(ss,'_PORTAL_ENTREGAS'),duplicate=all.filter(function(r){return r.ID===id;})[0];
  if(duplicate){if(String(duplicate.FOLIO)!==folio||String(duplicate.TAREA_ID)!==String(task.ID))portalFail_('La entrega no está disponible.',404);return {ok:true,submission:portalSubmissionDTO_(duplicate)};}
  var latest=portalLatestSubmission_(ss,task.ID,folio);if(latest&&['REVISADA','CALIFICADA'].indexOf(portalText_(latest.ESTADO))>=0)throw Error('La entrega ya fue revisada. Solicita a administración una nueva corrección.');
  var file=portalStoreFile_(fileInput,'tasks',folio+'-'+id);
  try{portalPutRow_(ss,'_PORTAL_ENTREGAS',0,{ID:id,TAREA_ID:task.ID,FOLIO:folio,COMENTARIO:portalSafeCell_(comment),ARCHIVO:file.getId(),NOMBRE:portalSafeCell_(fileInput.name),MIME:fileInput.mime,TAMANO:fileInput.size,FECHA:new Date(),ESTADO:'Entregada',CALIFICACION:'',RETROALIMENTACION:'',REVISADO:'',REVISADO_POR:'',SOLICITUD:requestId});}catch(e){file.setTrashed(true);throw e;}
  return {ok:true,submission:portalSubmissionDTO_(portalLatestSubmission_(ss,task.ID,folio))};
 }finally{lock.releaseLock();}
}
function portalAdminTasks_(ss){return {ok:true,tasks:portalRows_(ss,'_PORTAL_TAREAS').sort(function(a,b){return new Date(b.CREADO)-new Date(a.CREADO)||b._row-a._row;}).map(function(r){var d=portalTaskDTO_(ss,r),audience=portalRows_(ss,'_PORTAL_TAREA_ALUMNOS').filter(function(a){return String(a.TAREA_ID)===String(r.ID);});d.assigned=audience.length;d.delivered=audience.filter(function(a){return !!portalLatestSubmission_(ss,r.ID,String(a.FOLIO));}).length;d.pendingReview=audience.filter(function(a){var s=portalLatestSubmission_(ss,r.ID,String(a.FOLIO));return s&&portalText_(s.ESTADO)==='ENTREGADA';}).length;return d;})};}
function portalAdminTask_(ss,id){
 var task=portalTask_(ss,id),grades=portalRows_(ss,'EVALUACIONES'),students=portalRows_(ss,'ALUMNOS');
 var recipients=portalRows_(ss,'_PORTAL_TAREA_ALUMNOS').filter(function(r){return String(r.TAREA_ID)===String(id);}).map(function(r){var folio=String(r.FOLIO),a=students.filter(function(a){return String(a.FOLIO).trim().toUpperCase()===folio;})[0],submission=portalLatestSubmission_(ss,id,folio),grade=grades.filter(function(g){return String(g.FOLIO).trim().toUpperCase()===folio&&String(g.ID)===portalTaskGradeId_(id);})[0];return {student:{folio:folio,name:a?String(a.NOMBRE):'Registro de alumno',course:a?String(a.DIPLOMADO):''},submission:portalSubmissionDTO_(submission),gradeRevision:grade?portalGradeRevision_(grade):'',grade:grade?portalNumber_(grade.CALIFICACION!==undefined?grade.CALIFICACION:grade.CALIFICACIONES):null};});
 return {ok:true,task:portalTaskDTO_(ss,task),recipients:recipients};
}
function portalReviewTask_(ss,auth,b){
 portalRequireAdmin_(auth);var score=b.score===null||b.score===''?null:Number(b.score),feedback=String(b.feedback||'').trim(),status=String(b.status||'Revisada');
 if((score!==null&&(!Number.isFinite(score)||score<0||score>10))||feedback.length>4000||['Revisada','Requiere corrección'].indexOf(status)<0)throw Error('Revisa la calificación y los comentarios.');
 var lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  var row=portalRows_(ss,'_PORTAL_ENTREGAS').filter(function(r){return String(r.ID)===String(b.id);})[0];if(!row)portalFail_('La entrega no está disponible.',404);
  var latest=portalLatestSubmission_(ss,row.TAREA_ID,String(row.FOLIO));if(!latest||latest.ID!==row.ID||String(b.revision||'')!==portalSubmissionRevision_(row))portalFail_('La entrega cambió. Actualiza antes de revisar.',409);
  var task=portalTask_(ss,row.TAREA_ID),grade=portalRows_(ss,'EVALUACIONES').filter(function(g){return String(g.FOLIO).trim().toUpperCase()===String(row.FOLIO)&&String(g.ID)===portalTaskGradeId_(task.ID);})[0];
  if(score!==null){if(!grade||String(b.gradeRevision||'')!==portalGradeRevision_(grade))portalFail_('La calificación cambió. Actualiza antes de guardar.',409);portalPutRow_(ss,'EVALUACIONES',grade._row,{CALIFICACION:score,CALIFICACIONES:score,ESTADO:score>=7?'Aprobado':'Reprobado',FECHA:new Date()});}
  portalPutRow_(ss,'_PORTAL_ENTREGAS',row._row,{ESTADO:status==='Requiere corrección'?status:score===null?'Revisada':'Calificada',CALIFICACION:score===null?'':score,RETROALIMENTACION:portalSafeCell_(feedback),REVISADO:new Date(),REVISADO_POR:auth.email});
  portalAudit_(ss,auth,'REVISAR_TAREA',String(row.FOLIO),String(row.ID),{status:row.ESTADO,score:row.CALIFICACION},{status:status,score:score});return portalAdminTask_(ss,task.ID);
 }finally{lock.releaseLock();}
}
function portalAcademicAction_(ss,auth,b){
 if(!portalAcademicReady_())portalFail_('Estas funciones están pendientes de activación por administración.',503);
 var action=String(b.action||''),admin=action.indexOf('admin_')===0;
 if(admin){portalRequireAdmin_(auth);
  if(action==='admin_documents'){var folio=String(b.folio||'').trim().toUpperCase(),matches=portalRows_(ss,'ALUMNOS').filter(function(a){return String(a.FOLIO).trim().toUpperCase()===folio;});if(matches.length!==1)portalFail_('El registro del alumno requiere revisión.',404);var result=portalDocumentArchive_(ss,folio);result.student=portalStudent_(matches[0]);return result;}
  if(action==='admin_document_file'){var r=portalRows_(ss,'_PORTAL_DOCUMENTOS').filter(function(r){return String(r.ID)===String(b.id);})[0];if(!r)portalFail_('Documento no disponible.',404);return portalPrivateFile_(r.ARCHIVO);}
  if(action==='admin_tasks')return portalAdminTasks_(ss);
  if(action==='admin_task')return portalAdminTask_(ss,String(b.id||''));
  if(action==='admin_task_preview'){var targets=portalExamRecipients_(ss,b);return {ok:true,count:targets.length,fingerprint:portalRecipientsHash_(targets)};}
  if(action==='admin_publish_task')return portalTaskPublish_(ss,auth,b);
  if(action==='admin_review_task')return portalReviewTask_(ss,auth,b);
  if(action==='admin_task_file')return portalPrivateFile_(portalTask_(ss,b.id).ARCHIVO);
  if(action==='admin_submission_file'){var r=portalRows_(ss,'_PORTAL_ENTREGAS').filter(function(r){return String(r.ID)===String(b.id);})[0];if(!r)portalFail_('Entrega no disponible.',404);return portalPrivateFile_(r.ARCHIVO);}
 }else{
  var a=portalStudentAuth_(auth),folio=String(a.FOLIO).trim().toUpperCase();
  if(action==='documents')return portalDocumentArchive_(ss,folio);
  if(action==='upload_document')return portalUploadDocument_(ss,a,b);
  if(action==='document_file'){var r=portalDocuments_(ss,folio).filter(function(r){return String(r.ID)===String(b.id);})[0];if(!r)portalFail_('Documento no disponible para tu cuenta.',404);return portalPrivateFile_(r.ARCHIVO);}
  if(action==='credential'){var photo=portalDocuments_(ss,folio).filter(function(r){return r.TIPO==='FOTOGRAFIA';})[0];if(!photo)throw Error('Sube tu fotografía en Expediente del alumno para generar tu credencial.');return {ok:true,student:portalStudent_(a),photo:portalPrivateFile_(photo.ARCHIVO),issuedAt:new Date().toISOString(),signer:{name:'Alexis Soto',role:'Director General'}};}
  if(action==='tasks')return portalStudentTasks_(ss,a);
  if(action==='submit_task')return portalSubmitTask_(ss,a,b);
  if(action==='task_file')return portalPrivateFile_(portalRequireTask_(ss,b.id,folio).ARCHIVO);
  if(action==='submission_file'){var r=portalRows_(ss,'_PORTAL_ENTREGAS').filter(function(r){return String(r.ID)===String(b.id)&&String(r.FOLIO)===folio;})[0];if(!r)portalFail_('Entrega no disponible para tu cuenta.',404);portalRequireTask_(ss,r.TAREA_ID,folio);return portalPrivateFile_(r.ARCHIVO);}
 }
 throw Error('Acción académica no disponible.');
}
