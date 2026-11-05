import {normalizeStudentPhone} from './credential-contact';

export type ProfileValues={name:string;email:string;phone:string};
export function profileValues(student:any):ProfileValues{return {name:String(student?.name||''),email:String(student?.email||''),phone:String(student?.phone||'')};}
export function studentProfileChanges(previous:ProfileValues,values:ProfileValues){
 const changes:Partial<ProfileValues>={};
 const name=String(values.name).trim().replace(/\s+/g,' '),email=String(values.email).trim().toLowerCase(),phone=String(values.phone).trim();
 if(name!==previous.name){if(name.length<3||name.length>120||/[\x00-\x1f\x7f<>]/.test(values.name)||/^[=+@-]/.test(name))throw Error('Escribe tu nombre completo, de 3 a 120 caracteres.');changes.name=name;}
 if(email!==previous.email){if(email.length>160||/^\d{6}@evolvacademy\.mx$/.test(email)||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\x00-\x1f\x7f<>]/.test(email))throw Error('Escribe un correo personal válido, de hasta 160 caracteres.');changes.email=email;}
 if(phone!==previous.phone)changes.phone=normalizeStudentPhone(phone);
 return changes;
}
