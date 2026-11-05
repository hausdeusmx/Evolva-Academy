/* Evolva · entrega inicial de correo. Sin almacenamiento de credenciales en el navegador. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),form=$('mail-form'),submit=$('mail-submit'),status=$('mail-status'),retry=$('mail-retry'),result=$('mail-result'),folio=$('mail-folio'),curp=$('mail-curp'),password=$('mail-password'),email=$('mail-email');
 const endpoint=String(window.EVOLVA_CONFIG?.API_URL||'').trim();let token='',widget=null,ready=false,numericMode=false,busy=false,scriptPromise=null,clearTimer;
 function announce(message,error=false){status.textContent=message;status.classList.toggle('is-error',error);}
 function enabled(){submit.disabled=!ready||!token||busy;}
 async function request(action,body={}){
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw Error('La consulta está pendiente de activación. Contacta a administración.');
  let response;try{response=await fetch(endpoint,{method:'POST',credentials:'omit',redirect:'follow',cache:'no-store',referrerPolicy:'no-referrer',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...body,action}),signal:AbortSignal.timeout(45000)});}catch{throw Error(action==='health'?'No se pudo conectar. Intenta revisar la disponibilidad.':'No se confirmó la entrega. Si tu acceso ya fue entregado, solicita a administración una nueva contraseña inicial.');}
  let data;try{data=await response.json();}catch{throw Error('No se pudo confirmar la respuesta. Solicita ayuda a administración.');}
  if(!data.ok)throw Error(data.error||'No se pudo completar la consulta.');return data;
 }
 function resetCaptcha(){token='';if(widget!==null&&window.turnstile)window.turnstile.reset(widget);enabled();}
 function loadCaptcha(){
  if(window.turnstile)return Promise.resolve();if(scriptPromise)return scriptPromise;
  scriptPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>{if(window.turnstile)resolve();else{scriptPromise=null;script.remove();reject(Error('No se pudo iniciar la verificación. Vuelve a revisar la disponibilidad.'));}};script.onerror=()=>{scriptPromise=null;script.remove();reject(Error('No se pudo cargar la verificación. Revisa tu conexión e intenta de nuevo.'));};document.head.append(script);});return scriptPromise;
 }
 async function availability(){
  if(busy)return;ready=false;enabled();retry.disabled=true;announce('Consultando disponibilidad…');
  try{const h=await request('health');numericMode=h.features?.includes('institutional_login')===true;if(!h.features?.includes('institutional_delivery')){announce('La entrega de correo institucional está en preparación. Administración te avisará cuando puedas consultar tu acceso.');return;}
   await loadCaptcha();if(widget===null)widget=window.turnstile.render($('mail-captcha'),{sitekey:'0x4AAAAAAFO3iozVUJMFOZFC',theme:'light',callback:value=>{token=value;enabled();},'expired-callback':()=>{token='';enabled();},'error-callback':()=>{token='';enabled();announce('La verificación no se completó. Intenta de nuevo.',true);}});
   ready=true;announce('Completa tus datos y la verificación de seguridad.');enabled();
  }catch(e){announce(e.message,true);}finally{retry.disabled=false;}
 }
 function clearSecret(){clearTimeout(clearTimer);password.value='';password.type='password';email.value='';$('mail-show').textContent='Mostrar contraseña';$('mail-show').setAttribute('aria-pressed','false');result.hidden=true;form.hidden=false;curp.value='';resetCaptcha();}
 folio.addEventListener('input',()=>{folio.value=folio.value.toUpperCase().replace(/\s/g,'');});curp.addEventListener('input',()=>{curp.value=curp.value.toUpperCase().replace(/\s/g,'');});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!ready||!token||busy||!form.reportValidity())return;
  busy=true;enabled();retry.disabled=true;announce('Verificando tus datos…');const submittedFolio=folio.value.trim().toUpperCase();
  try{const data=await request('institutional_claim',{folio:submittedFolio,curp:curp.value.trim().toUpperCase(),turnstileToken:token});
   if(data.email!==(numericMode?submittedFolio.slice(7):submittedFolio)+'@evolvacademy.mx'||typeof data.password!=='string'||data.password.length<12)throw Error('No se pudo confirmar el acceso. Solicita una nueva entrega a administración.');
   email.value=data.email;password.value=data.password;data.password='';curp.value='';form.hidden=true;result.hidden=false;announce('Acceso entregado. Guarda tus datos antes de salir.');$('mail-result-title').focus();clearTimer=setTimeout(()=>{clearSecret();announce('Por seguridad se ocultó el acceso. Si no lo guardaste, solicita una nueva contraseña inicial a administración.');},300000);
  }catch(e){announce(e.message,true);}finally{busy=false;retry.disabled=false;resetCaptcha();}
 });
 $('mail-show').addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';$('mail-show').textContent=show?'Ocultar contraseña':'Mostrar contraseña';$('mail-show').setAttribute('aria-pressed',String(show));});
 for(const [button,input] of [['mail-copy-email',email],['mail-copy-password',password]])$(button).addEventListener('click',async()=>{try{await navigator.clipboard.writeText(input.value);announce(button==='mail-copy-email'?'Correo copiado.':'Contraseña copiada.');}catch{input.focus();input.select();announce('Selecciona el dato para copiarlo.');}});
 $('mail-clear').addEventListener('click',()=>{clearSecret();announce('Acceso oculto. Para otra entrega, solicita una nueva contraseña inicial a administración.');});retry.addEventListener('click',availability);
 window.addEventListener('pagehide',clearSecret);window.addEventListener('pageshow',event=>{if(event.persisted)availability();});
 availability();
})();

