const API_URL='https://script.google.com/macros/s/AKfycbyTcVS-daEhDz1N5dwZEaCHVQrm17hC5IjQZvujAiI2oXzpgS6BJhtlZlnv1yjBhYX7Yg/exec';
const form=document.getElementById('registroForm');
const button=document.getElementById('registroButton');
const errorBox=document.getElementById('registroError');
const captchaError=document.getElementById('captchaError');
const curp=document.getElementById('reg_curp');
let busy=false;
const course=new URLSearchParams(location.search).get('diplomado');
if(course==='Finanzas Personales')document.getElementById('cursoFinanzas').checked=true;
if(course==='Primeros Auxilios')document.getElementById('cursoAuxilios').checked=true;
window.EvolvaCourses?.preselect();
const paymentMode=document.getElementById('paymentMode');
const paymentSummary=document.getElementById('paymentModeSummary');
function updatePaymentPreview(){
 const selected=document.querySelector('input[name="diplomado"]:checked');
 const c=window.EvolvaCourses?.list?.find(x=>x.name===selected?.value);
 if(!c||!paymentSummary)return;
 const weeks=Number(c.weeks||8),weekly=Number(c.weekly||0),monthly=Number(c.monthly||weekly*4),total=Number(c.total||weekly*weeks),mode=paymentMode?.value||'weekly';
 const fmt=n=>'
curp.addEventListener('input',()=>{curp.value=curp.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,18);});
const date=new Date();
document.getElementById('reg_fecha').max=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
function resetCaptcha(){try{window.turnstile?.reset();}catch{}}
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(busy)return;
  errorBox.textContent='';captchaError.textContent='';
  let documentRequirements=false;
  try{documentRequirements=window.EvolvaDocuments?await window.EvolvaDocuments.requirements(true):false;}catch{errorBox.textContent='No pudimos comprobar la conexión del registro. Vuelve a intentarlo.';return;}
  if(busy)return;
  if(!form.reportValidity())return;
  const selected=document.querySelector('input[name="diplomado"]:checked');
  if(!selected){errorBox.textContent='Selecciona el curso que quieres cursar.';return;}
  if(window.EvolvaCourses?.isNew(selected.value)&&!window.EvolvaCourses.available(selected.value)){errorBox.textContent='Las inscripciones de este curso todavía están en preparación. Intenta cuando administración confirme su apertura.';return;}
  const phoneInput=document.getElementById('reg_phone'),phoneEnabled=phoneInput&&!phoneInput.disabled;let studentPhone='';if(phoneEnabled){const raw=phoneInput.value.trim();studentPhone=raw.replace(/[ ()-]/g,'');if(raw.length>24||!/^\+?[0-9 ()-]+$/.test(raw)||!/^\+?\d{10,15}$/.test(studentPhone)){errorBox.textContent='Escribe un teléfono de 10 a 15 dígitos; puedes incluir +52.';return;}}
  let token='';
  try{token=window.turnstile?.getResponse()||'';}catch{}
  if(!token){captchaError.textContent='Completa la verificación de seguridad antes de enviar tu registro.';captchaError.scrollIntoView({behavior:'smooth',block:'center'});return;}
  const read=id=>document.getElementById(id).value.trim();
  const params={accion:'registrar',diplomado:selected.value,nombre:read('reg_nombre'),edad:read('reg_edad'),estado:read('reg_estado'),curp:read('reg_curp').toUpperCase(),fecha:read('reg_fecha'),email:read('reg_email'),turnstileToken:token,paymentMode:paymentMode?.value||'weekly'};
  busy=true;button.disabled=true;form.setAttribute('aria-busy','true');button.textContent='Registrando tu inscripción…';
  try{
    let data;
    const documents=documentRequirements?await window.EvolvaDocuments.payload():{};
    const endpoint=String(window.EVOLVA_CONFIG?.API_URL||'').trim();
    if(endpoint){
      if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw new Error('La conexión del registro requiere revisión de administración.');
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},credentials:'omit',redirect:'follow',body:JSON.stringify({...params,...(phoneEnabled?{telefono:studentPhone}:{}),...documents,action:'register'}),signal:AbortSignal.timeout(60000)});
      if(!response.ok)throw new Error('No fue posible conectar con Evolva Academy.');
      try{data=await response.json();}catch{throw new Error('El servidor no devolvió una respuesta válida.');}
    }else{
      data=await window.EvolvaLegacy.call(API_URL,params);
    }
    if(!data?.ok)throw new Error(data?.error||data?.mensaje||'No fue posible completar la inscripción.');
    let folio=String(data.matricula||data.folio||'').trim().toUpperCase();
    if(/^\d{6}$/.test(folio))folio='EVOLVA-'+folio;
    if(!/^EVOLVA-\d{6}$/.test(folio))throw new Error('El servidor no devolvió una matrícula válida. Contacta a administración antes de intentar otro registro.');
    document.getElementById('codigoFolio').textContent=folio;
    document.getElementById('datoCorreo').textContent=data.alumno?.CORREO_PERSONAL||params.email;
    document.getElementById('datoPassword').textContent=data.password||'Solicita tu acceso a la administración de Evolva Academy.';
    document.getElementById('registroPago').href=window.EvolvaCourses?.isNew(params.diplomado)?'campus/?seccion=pagos':'pagos.html?folio='+encodeURIComponent(folio);
    const result=document.getElementById('folioResultado');
    form.style.display='none';result.style.display='block';
    result.setAttribute('tabindex','-1');result.focus();result.scrollIntoView({behavior:'smooth',block:'center'});
    resetCaptcha();
  }catch(error){
    errorBox.textContent=error.message||'No fue posible completar el registro.';
    errorBox.scrollIntoView({behavior:'smooth',block:'center'});resetCaptcha();
  }finally{busy=false;button.disabled=false;form.removeAttribute('aria-busy');button.textContent='Generar mi matrícula →';}
});
+Number(n).toLocaleString('es-MX')+' MXN';
 paymentSummary.textContent=mode==='monthly'?'Mensualidad '+fmt(monthly)+' · '+Math.ceil(weeks/4)+' mensualidades · Total '+fmt(total):mode==='total'?'Un solo pago de '+fmt(total)+'. Vence al inscribirte.':'Pago semanal '+fmt(weekly)+' · '+weeks+' semanas · Total '+fmt(total);
}
document.querySelectorAll('input[name="diplomado"]').forEach(el=>el.addEventListener('change',updatePaymentPreview));
paymentMode?.addEventListener('change',updatePaymentPreview);
updatePaymentPreview();
curp.addEventListener('input',()=>{curp.value=curp.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,18);});
const date=new Date();
document.getElementById('reg_fecha').max=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
function resetCaptcha(){try{window.turnstile?.reset();}catch{}}
form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(busy)return;
  errorBox.textContent='';captchaError.textContent='';
  let documentRequirements=false;
  try{documentRequirements=window.EvolvaDocuments?await window.EvolvaDocuments.requirements(true):false;}catch{errorBox.textContent='No pudimos comprobar la conexión del registro. Vuelve a intentarlo.';return;}
  if(busy)return;
  if(!form.reportValidity())return;
  const selected=document.querySelector('input[name="diplomado"]:checked');
  if(!selected){errorBox.textContent='Selecciona el curso que quieres cursar.';return;}
  if(window.EvolvaCourses?.isNew(selected.value)&&!window.EvolvaCourses.available(selected.value)){errorBox.textContent='Las inscripciones de este curso todavía están en preparación. Intenta cuando administración confirme su apertura.';return;}
  const phoneInput=document.getElementById('reg_phone'),phoneEnabled=phoneInput&&!phoneInput.disabled;let studentPhone='';if(phoneEnabled){const raw=phoneInput.value.trim();studentPhone=raw.replace(/[ ()-]/g,'');if(raw.length>24||!/^\+?[0-9 ()-]+$/.test(raw)||!/^\+?\d{10,15}$/.test(studentPhone)){errorBox.textContent='Escribe un teléfono de 10 a 15 dígitos; puedes incluir +52.';return;}}
  let token='';
  try{token=window.turnstile?.getResponse()||'';}catch{}
  if(!token){captchaError.textContent='Completa la verificación de seguridad antes de enviar tu registro.';captchaError.scrollIntoView({behavior:'smooth',block:'center'});return;}
  const read=id=>document.getElementById(id).value.trim();
  const params={accion:'registrar',diplomado:selected.value,nombre:read('reg_nombre'),edad:read('reg_edad'),estado:read('reg_estado'),curp:read('reg_curp').toUpperCase(),fecha:read('reg_fecha'),email:read('reg_email'),turnstileToken:token};
  busy=true;button.disabled=true;form.setAttribute('aria-busy','true');button.textContent='Registrando tu inscripción…';
  try{
    let data;
    const documents=documentRequirements?await window.EvolvaDocuments.payload():{};
    const endpoint=String(window.EVOLVA_CONFIG?.API_URL||'').trim();
    if(endpoint){
      if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw new Error('La conexión del registro requiere revisión de administración.');
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},credentials:'omit',redirect:'follow',body:JSON.stringify({...params,...(phoneEnabled?{telefono:studentPhone}:{}),...documents,action:'register'}),signal:AbortSignal.timeout(60000)});
      if(!response.ok)throw new Error('No fue posible conectar con Evolva Academy.');
      try{data=await response.json();}catch{throw new Error('El servidor no devolvió una respuesta válida.');}
    }else{
      data=await window.EvolvaLegacy.call(API_URL,params);
    }
    if(!data?.ok)throw new Error(data?.error||data?.mensaje||'No fue posible completar la inscripción.');
    let folio=String(data.folio||'').trim().toUpperCase();
    if(/^\d{6}$/.test(folio))folio='EVOLVA-'+folio;
    if(!/^EVOLVA-\d{6}$/.test(folio))throw new Error('El servidor no devolvió un folio válido. Contacta a administración antes de intentar otro registro.');
    document.getElementById('codigoFolio').textContent=folio;
    document.getElementById('datoCorreo').textContent=data.alumno?.CORREO_PERSONAL||params.email;
    document.getElementById('datoPassword').textContent=data.password||'Solicita tu acceso a la administración de Evolva Academy.';
    document.getElementById('registroPago').href=window.EvolvaCourses?.isNew(params.diplomado)?'campus/?seccion=pagos':'pagos.html?folio='+encodeURIComponent(folio);
    const result=document.getElementById('folioResultado');
    form.style.display='none';result.style.display='block';
    result.setAttribute('tabindex','-1');result.focus();result.scrollIntoView({behavior:'smooth',block:'center'});
    resetCaptcha();
  }catch(error){
    errorBox.textContent=error.message||'No fue posible completar el registro.';
    errorBox.scrollIntoView({behavior:'smooth',block:'center'});resetCaptcha();
  }finally{busy=false;button.disabled=false;form.removeAttribute('aria-busy');button.textContent='Generar mi matrícula →';}
});
