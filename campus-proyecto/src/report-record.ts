export const REPORT_TITLE='Reporte académico de calificaciones';
export const PORTAL_ORIGIN='';
export const SIGNER={name:'Alexis Soto',role:'Director General'};
export function normalizeReportCode(value:string){return value.trim().toUpperCase();}
export function validReportCode(value:string){return /^EVR-[A-F0-9]{32}$/.test(normalizeReportCode(value));}
export function reportSnapshot(data:any){return {title:REPORT_TITLE,demo:!!data.demo,student:{name:String(data.student.name),folio:String(data.student.folio),course:String(data.student.course),group:String(data.student.group||'Sin asignar')},progress:Number(data.progress),average:data.average===null?null:Number(data.average),grades:data.grades.map((g:any)=>({id:String(g.id),module:String(g.module||''),title:String(g.title||''),score:g.score===null?null:Number(g.score),status:String(g.status||'')})),signer:SIGNER};}
export function createReportMetadata(issuedAt=new Date().toISOString()){const code='EVR-'+Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();return {code,issuedAt,validationUrl:PORTAL_ORIGIN+'/validar?codigo='+code,signer:SIGNER};}
export function authorizeReport(row:any,owner:string,student:string|undefined,admin:boolean){return !!row&&(admin||(row.owner===owner&&row.student===student));}
export async function sha256(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),x=>x.toString(16).padStart(2,'0')).join('');}
export async function readVerifiedReport(row:any){if(!row)return null;if(await sha256(row.snapshot)!==row.fingerprint)throw Error('No se pudo verificar la integridad del registro.');return JSON.parse(row.snapshot);}
