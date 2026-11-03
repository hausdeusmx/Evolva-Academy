export const schoolEmail='soporte@evolvacademy.mx';
export const campusAddress='https://evolvacademy.mx/campus/';
export function normalizeStudentPhone(value:string){
 const raw=String(value||'').trim();
 if(raw.length>24||!/^\+?[0-9 ()-]+$/.test(raw))throw Error('Escribe un teléfono de 10 a 15 dígitos; puedes incluir +52.');
 const phone=raw.replace(/[ ()-]/g,'');if(!/^\+?\d{10,15}$/.test(phone))throw Error('Escribe un teléfono de 10 a 15 dígitos; puedes incluir +52.');return phone;
}
export function credentialContact(student:any){
 const folio=String(student.folio||'').trim().toUpperCase();
 return {institutional:String(student.institutional||'').trim()||(/^EVOLVA-\d{6}$/.test(folio)?folio+'@evolvacademy.mx':'Por asignar'),phone:String(student.phone||'').trim()||'Sin registrar',school:schoolEmail};
}
