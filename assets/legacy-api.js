/* Existing enrollment service: JSONP protocol is retained for compatibility. */
window.EvolvaLegacy={
  call(url,params,timeoutMs=20000){
    return new Promise((resolve,reject)=>{
      const callback='evolvaCallback_'+Date.now()+'_'+Math.floor(Math.random()*1000000);
      const script=document.createElement('script');
      let finished=false;
      function cleanup(){clearTimeout(timer);script.remove();delete window[callback];}
      function done(error,data){if(finished)return;finished=true;cleanup();error?reject(error):resolve(data);}
      const timer=setTimeout(()=>done(new Error('La consulta tardó demasiado. Intenta nuevamente.')),timeoutMs);
      window[callback]=data=>done(null,data);
      script.onerror=()=>done(new Error('No fue posible conectar con el servidor de Evolva Academy. Intenta nuevamente.'));
      const query=new URLSearchParams({...params,callback});
      script.src=url+'?'+query.toString();
      document.head.appendChild(script);
    });
  },
  normalizeFolio(value){return String(value||'').toUpperCase().replace(/^EVOLVA-?/,'').replace(/\D/g,'').slice(0,6);}
};
