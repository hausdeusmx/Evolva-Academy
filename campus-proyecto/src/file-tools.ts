export type UploadData={name:string;mime:string;base64:string};
export const workAccept='.pdf,.docx,.pptx,.jpg,.jpeg,.png';
const office:Record<string,string>={docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
export async function fileData(file:File,kind:'curp'|'photo'|'work'='work'):Promise<UploadData>{
 const limit=(kind==='photo'?1:2)*1024*1024;
 if(!file?.size||file.size>limit)throw Error(kind==='photo'?'Selecciona una fotografía de hasta 1 MB.':'Selecciona un archivo de hasta 2 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),ext=file.name.split('.').pop()?.toLowerCase()||'';
 const pdf=String.fromCharCode(...bytes.slice(0,5))==='%PDF-',png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,zip=bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4;
 let mime=pdf&&ext==='pdf'?'application/pdf':png&&ext==='png'?'image/png':jpg&&['jpg','jpeg'].includes(ext)?'image/jpeg':kind==='work'&&zip&&office[ext]?office[ext]:'';
 if(kind==='curp'&&mime!=='application/pdf')mime='';if(kind==='photo'&&!mime.startsWith('image/'))mime='';
 if(!mime)throw Error(kind==='curp'?'Tu CURP debe ser un archivo PDF.':kind==='photo'?'Usa una fotografía JPG o PNG.':'Usa PDF, DOCX, PPTX, JPG o PNG.');
 let value='';for(let i=0;i<bytes.length;i+=16384)value+=String.fromCharCode(...bytes.subarray(i,i+16384));
 return {name:file.name,mime,base64:btoa(value)};
}
export function base64Bytes(base64:string){return Uint8Array.from(atob(base64),c=>c.charCodeAt(0));}
export function saveBytes(bytes:Uint8Array,name:string,mime='application/pdf'){
 const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:mime})),a=document.createElement('a');a.href=url;a.download=name.replace(/[\\/\x00-\x1f]/g,'_');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
export function savePrivateFile(file:any){if(!file.base64)throw Error('El archivo no está disponible.');saveBytes(base64Bytes(file.base64),file.name||'documento.pdf',file.mime);}
export function fileSize(size:number){return size>=1024*1024?(size/(1024*1024)).toFixed(1)+' MB':Math.max(1,Math.round(size/1024))+' KB';}
