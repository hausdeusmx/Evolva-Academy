/* Public build checks never read credentials or reload unsaved work. */
(function(){
 'use strict';
 var lastCheck=0,checking=false;
 function showUpdate(offline){
  if(!document.body||document.getElementById('campus-update-notice'))return;
  var notice=document.createElement('section');notice.id='campus-update-notice';notice.setAttribute('role','alert');notice.setAttribute('aria-label',offline?'Sin conexión':'Actualización del campus');
  notice.style.cssText='position:fixed;z-index:2147483647;bottom:18px;left:18px;right:18px;max-width:660px;margin:auto;padding:18px 20px;background:#fff;border:1px solid #d9bfc7;border-left:5px solid #681727;border-radius:12px;box-shadow:0 8px 40px #480a1533;color:#480a15;font:14px/1.5 Arial,sans-serif';
  var copy=document.createElement('p');copy.style.cssText='margin:0 0 12px';copy.textContent=offline?'No hay conexión para cargar este apartado. Conéctate y vuelve a intentarlo.':'Hay una versión nueva del campus y sus documentos. Guarda tus cambios y pulsa Actualizar campus.';notice.appendChild(copy);
  var refresh=document.createElement('a'),url=new URL(window.location.href);url.searchParams.set('_actualizacion',String(Date.now()));refresh.href=url.href;refresh.textContent=offline?'Volver a cargar':'Actualizar campus';refresh.style.cssText='display:inline-block;padding:9px 14px;background:#681727;color:#fff;text-decoration:none;border-radius:7px;font-weight:600';notice.appendChild(refresh);
  var close=document.createElement('button');close.type='button';close.textContent='Cerrar aviso';close.style.cssText='margin-left:12px;padding:9px;background:transparent;border:0;color:#681727;text-decoration:underline;cursor:pointer';close.addEventListener('click',function(){notice.remove();});notice.appendChild(close);document.body.appendChild(notice);
 }
 function checkBuild(){
  if(checking||navigator.onLine===false||Date.now()-lastCheck<60000||typeof window.fetch!=='function')return;
  var tag=document.querySelector('meta[name="evolva-build"]'),current=tag&&tag.getAttribute('content');if(!/^[a-f0-9]{12}$/.test(current||''))return;
  checking=true;lastCheck=Date.now();var url=new URL('./build-assets.json',document.baseURI||window.location.href);url.searchParams.set('_comprobar',String(lastCheck));
  var controller=typeof window.AbortController==='function'?new window.AbortController():null,timer=controller?window.setTimeout(function(){controller.abort();},8000):null;
  return window.fetch(url.href,{cache:'no-store',credentials:'omit',signal:controller?controller.signal:undefined}).then(function(r){return r.ok?r.json():null;}).then(function(data){if(data&&/^[a-f0-9]{12}$/.test(data.version||'')&&data.version!==current)showUpdate(false);}).catch(function(){/* An unavailable version check must not block the campus. */}).finally(function(){if(timer)window.clearTimeout(timer);checking=false;});
 }
 window.addEventListener('vite:preloadError',function(){showUpdate(navigator.onLine===false);});
 window.addEventListener('load',checkBuild);window.addEventListener('pageshow',checkBuild);window.addEventListener('focus',checkBuild);
})();
