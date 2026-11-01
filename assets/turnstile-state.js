window.evolvaCaptchaError=()=>{
  const field=document.getElementById('captchaError');
  if(field)field.textContent='No fue posible cargar la verificación de seguridad. Recarga la página; si el problema continúa, contacta a la administración de Evolva Academy.';
  return true;
};
window.evolvaCaptchaReady=()=>{const field=document.getElementById('captchaError');if(field)field.textContent='';};
window.evolvaCaptchaExpired=()=>{const field=document.getElementById('captchaError');if(field)field.textContent='La verificación expiró. Complétala nuevamente para continuar.';};
