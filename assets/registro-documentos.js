(function(){
  const photo=document.getElementById('reg_photo'),curp=document.getElementById('reg_curp_pdf'),section=document.getElementById('registroDocumentos');
  let pending=null;
  async function requirements(force){
    const endpoint=String(window.EVOLVA_CONFIG?.API_URL||'').trim();
    if(!endpoint)return false;
    if(pending&&!force)return pending;
    pending=(async()=>{
      const response=await fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'health'}),signal:AbortSignal.timeout(25000)});
      const data=await response.json();if(!data.ok)throw Error('No se pudo comprobar la disponibilidad del registro.');
      const ready=data.version>=5&&data.features?.includes('documents');
      section.hidden=!ready;photo.disabled=!ready;curp.disabled=!ready;photo.required=!!ready;curp.required=!!ready;return !!ready;
    })();
    return pending;
  }
  async function read(file,kind){
    const max=(kind==='photo'?1:2)*1024*1024;if(!file||!file.size||file.size>max)throw Error(kind==='photo'?'Selecciona una fotografía JPG o PNG de hasta 1 MB.':'Selecciona tu CURP en PDF de hasta 2 MB.');
    const bytes=new Uint8Array(await file.arrayBuffer()),ext=file.name.split('.').pop().toLowerCase();
    const pdf=String.fromCharCode(...bytes.slice(0,5))==='%PDF-'&&ext==='pdf',png=[137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x)&&ext==='png',jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255&&['jpg','jpeg'].includes(ext);
    const mime=kind==='curp'&&pdf?'application/pdf':kind==='photo'&&png?'image/png':kind==='photo'&&jpg?'image/jpeg':'';
    if(!mime)throw Error(kind==='curp'?'El documento CURP debe ser un archivo PDF.':'La fotografía debe ser JPG o PNG.');
    let content='';for(let i=0;i<bytes.length;i+=16384)content+=String.fromCharCode(...bytes.subarray(i,i+16384));
    return {name:file.name,mime,base64:btoa(content)};
  }
  function requestId(){if(crypto.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;const h=Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);}
  let id='';
  window.EvolvaDocuments={requirements,async payload(){if(!id)id=requestId();return {requestId:id,curpFile:await read(curp.files?.[0],'curp'),photoFile:await read(photo.files?.[0],'photo')};}};
  requirements(false).catch(()=>{});
})();
