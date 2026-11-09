/* Local date calculation only. This does not query or certify a CURP. */
(()=>{'use strict';
 function age(value,now=new Date()){
  const curp=String(value||'').trim().toUpperCase();
  if(!/^[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(curp))return null;
  const year=(/[A-Z]/.test(curp[16])?2000:1900)+Number(curp.slice(4,6)),month=Number(curp.slice(6,8)),day=Number(curp.slice(8,10)),birth=new Date(Date.UTC(year,month-1,day));
  if(birth.getUTCFullYear()!==year||birth.getUTCMonth()!==month-1||birth.getUTCDate()!==day)return null;
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Ciudad_Juarez',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
  const today=parts.year+'-'+parts.month+'-'+parts.day,date=String(year)+'-'+curp.slice(6,8)+'-'+curp.slice(8,10);
  if(date>today)return null;
  return Number(parts.year)-year-(today.slice(5)<date.slice(5)?1:0);
 }
 window.EvolvaCurpAge=Object.freeze({age});
})();
