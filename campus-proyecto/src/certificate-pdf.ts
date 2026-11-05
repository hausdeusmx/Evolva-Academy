import {createDocumentKit,documentColors,documentDate,documentDuration,wrapDocumentText} from './report-pdf';
import {campusAddress,schoolEmail} from './credential-contact';

export async function createCompletionCertificatePDF(data:any):Promise<Uint8Array>{
 const student=data.student||{},issuedAt=data.issuedAt||new Date().toISOString();
 const k=await createDocumentKit('Constancia de finalización - '+String(student.folio||'Evolva Academy'),issuedAt),{pdf,regular,bold,write,lines,brand,qr,field,sign}=k,{wine,gold,border,muted,white}=documentColors;
 pdf.setSubject('Constancia de finalización emitida por Evolva Academy');
 const page=pdf.addPage([841.89,595.28]);page.drawRectangle({x:0,y:0,width:30,height:596,color:wine});page.drawRectangle({x:30,y:0,width:5,height:596,color:gold});page.drawRectangle({x:57,y:25,width:758,height:545,borderColor:border,borderWidth:.8});page.drawRectangle({x:79,y:480,width:203,height:67,color:wine});brand(page,90,486,181);
 write(page,'EVOLVA ACADEMY',579,529,10,bold,wine);write(page,'FORMACIÓN EN LÍNEA',579,514,7.5,regular,muted);write(page,'CONSTANCIA',88,439,31,bold,wine);write(page,'DE FINALIZACIÓN',90,413,15,bold,muted);write(page,'Evolva Academy otorga la presente a',90,380,10.5,regular,muted);
 let size=28;while(wrapDocumentText(student.name||'Alumno',bold,size,650).length>1&&size>13)size-=.5;const used=lines(page,student.name||'Alumno',88,343,size,650,bold,wine,size*1.15);const introY=343-used-11;write(page,'Por concluir el curso de',90,introY,10.5,regular,muted);
 let courseSize=20;while(wrapDocumentText(student.course||'Curso',bold,courseSize,650).length>1&&courseSize>13)courseSize-=.5;const courseY=introY-29;lines(page,student.course||'Curso',88,courseY,courseSize,650,bold,wine,23);
 const infoY=222;field(page,'Matrícula / folio',student.folio||'No registrado',90,infoY,210);field(page,'Modalidad / duración',(student.modality||'En línea')+' / '+documentDuration(data),332,infoY,230);field(page,'Promedio general',data.average==null?'No registrado':data.average+' / 10',593,infoY,180);
 field(page,'Grupo',student.group||'Por asignar',90,infoY-46,210);field(page,'Inscripción',documentDate(student.registered),332,infoY-46,230);field(page,'Emisión',documentDate(issuedAt),593,infoY-46,180);
 sign(page,90,87);qr(page,campusAddress,693,58,82);write(page,'ACCESO AL CAMPUS',684,47,6.5,bold,muted);write(page,schoolEmail,332,92,8,regular,wine);write(page,'Firma tipográfica institucional',332,77,6.5,regular,muted);
 write(page,data.demo?'MUESTRA DE PRUEBA · SIN VALIDEZ ACADÉMICA':'Documento institucional emitido a partir del registro autorizado.',90,39,6.5,bold,data.demo?gold:muted);
 return pdf.save();
}
