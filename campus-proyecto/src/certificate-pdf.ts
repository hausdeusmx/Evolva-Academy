import {studentMatricula} from './student-identity';
import {createDocumentKit,documentColors,documentDate,documentDuration} from './report-pdf';
import {campusAddress} from './credential-contact';

export async function createCompletionCertificatePDF(data:any):Promise<Uint8Array>{
 const s=data.student||{},issuedAt=data.issuedAt||new Date().toISOString(),k=await createDocumentKit('Constancia de finalización - '+String(studentMatricula(s)||'Evolva Academy'),issuedAt);
 const {pdf,regular,bold,serif,write,brand,center,ornament,qr,sign}=k,{wine,gold,muted,border,white}=documentColors;
 pdf.setSubject('Constancia de finalización emitida por Evolva Academy');
 const page=pdf.addPage([841.89,595.28]),cx=400;
 page.drawRectangle({x:810,y:0,width:32,height:596,color:wine});page.drawRectangle({x:803,y:0,width:1.2,height:596,color:gold});ornament(page,814,13,569,23,white,.88);
 ornament(page,54,-22,286,130,wine,.035);ornament(page,118,-65,235,86,wine,.025);
 page.drawRectangle({x:42,y:506,width:151,height:51,color:wine});brand(page,50,511,135);
 write(page,'EVOLVA ACADEMY',566,542,11,bold,wine);write(page,'FORMACIÓN CONTINUA',566,525,7.5,regular,muted);write(page,'APRENDER. EVOLUCIONAR. AVANZAR.',566,512,6,regular,muted);
 page.drawLine({start:{x:42,y:490},end:{x:762,y:490},thickness:.7,color:border});
 center(page,'Evolva Academy otorga la presente',458,11,660,regular,muted,cx);
 center(page,'CONSTANCIA',406,47,690,serif,wine,cx);
 center(page,'DE FINALIZACIÓN',383,9,660,bold,muted,cx);
 const nameHeight=center(page,s.name||'Alumno',339,25,658,bold,wine,cx,2);
 const nameBottom=339-nameHeight+10;page.drawLine({start:{x:144,y:nameBottom-8},end:{x:656,y:nameBottom-8},thickness:.6,color:border});
 const introY=nameBottom-33;center(page,'Por haber concluido satisfactoriamente el curso',introY,10.5,660,regular,muted,cx);
 const courseY=introY-31,courseHeight=center(page,s.course||'Curso',courseY,22,660,bold,wine,cx,2);
 const detailsY=Math.min(201,courseY-courseHeight-8),duration=documentDuration(data),details=[s.modality||'En línea',duration==='No registrada'?'':duration,'Grupo '+(s.group||'por asignar')].filter(Boolean).join('  ·  ');
 center(page,details,detailsY,10,660,regular,muted,cx);
 center(page,'Matrícula '+(studentMatricula(s)||'No registrada')+'   ·   Promedio '+(data.average==null?'pendiente':data.average+' / 10'),detailsY-22,9,660,bold,wine,cx);
 center(page,'Se expide el '+documentDate(issuedAt)+'.',133,10,650,regular,muted,cx);
 sign(page,67,62);write(page,'Firma tipográfica institucional',67,32,6.5,regular,muted);
 if(data.certificateCode){write(page,'CÓDIGO DE CONSTANCIA',310,77,6,bold,muted);write(page,data.certificateCode,310,63,6.8,regular,wine);}
 write(page,'Consulta el estado vigente con el QR.',310,45,7,regular,muted);
 qr(page,data.validationUrl||campusAddress,676,39,84);write(page,data.validationUrl?'VERIFICAR CONSTANCIA':'ACCESO AL CAMPUS',675,28,6,bold,muted);
 center(page,data.demo?'MUESTRA DE PRUEBA · SIN VALIDEZ ACADÉMICA':'Documento institucional emitido a partir del registro autorizado.',15,6,670,regular,data.demo?gold:muted,cx);
 return pdf.save();
}
