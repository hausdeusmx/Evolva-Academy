import {studentMatricula} from './student-identity';
import {createDocumentKit,documentColors,documentDate,documentDuration} from './report-pdf';
import {campusAddress} from './credential-contact';
export async function createCompletionCertificatePDF(data:any):Promise<Uint8Array>{
 const s=data.student||{},issuedAt=data.issuedAt||new Date().toISOString(),k=await createDocumentKit('Constancia de finalización - '+String(studentMatricula(s)||'Evolva Academy'),issuedAt);
 const {pdf,regular,bold,serif,write,brand,center,ornament,qr,sign}=k,{wine,muted,border,white}=documentColors;
 pdf.setSubject('Constancia de finalización emitida por Evolva Academy');
 const page=pdf.addPage([841.89,595.28]),cx=401;
 page.drawRectangle({x:24,y:24,width:793.89,height:547.28,borderColor:wine,borderWidth:1});page.drawRectangle({x:32,y:32,width:777.89,height:531.28,borderColor:border,borderWidth:.45});
 page.drawRectangle({x:777,y:24,width:40.89,height:547.28,color:wine});ornament(page,785,36,521,22,white,.5);page.drawRectangle({x:24,y:547,width:78,height:24,color:wine});
 brand(page,57,491,155);write(page,'FORMACIÓN CONTINUA',562,531,8,bold,wine);write(page,'EVOLVA ACADEMY',562,515,7,regular,muted);page.drawLine({start:{x:57,y:478},end:{x:746,y:478},color:border,thickness:.65});
 center(page,'Evolva Academy otorga la presente',449,10.5,660,regular,muted,cx);center(page,'CONSTANCIA',391,52,660,serif,wine,cx);center(page,'DE FINALIZACIÓN',368,8.5,650,bold,muted,cx);
 const nameHeight=center(page,s.name||'Alumno',334,25,649,bold,wine,cx,2),nameBottom=334-nameHeight+12;page.drawLine({start:{x:157,y:nameBottom-7},end:{x:645,y:nameBottom-7},color:wine,thickness:.55});
 const introY=nameBottom-29;center(page,'Por haber concluido satisfactoriamente el curso',introY,10,650,regular,muted,cx);const courseY=introY-30,used=center(page,s.course||'Curso',courseY,22,648,bold,wine,cx,2),detailsY=Math.min(190,courseY-used-7),duration=documentDuration(data);
 center(page,[s.modality||'En línea',duration==='No registrada'?'':duration,'Grupo '+(s.group||'por asignar')].filter(Boolean).join('  ·  '),detailsY,9,650,regular,muted,cx);center(page,'Matrícula '+(studentMatricula(s)||'No registrada')+'   ·   Promedio '+(data.average==null?'pendiente':data.average+' / 10'),detailsY-20,8.8,650,bold,wine,cx);center(page,'Se expide el '+documentDate(issuedAt)+'.',Math.min(135,detailsY-42),9.2,650,regular,muted,cx);
 sign(page,59,65);write(page,'Firma tipográfica institucional',59,39,5.8,regular,muted);if(data.certificateCode){write(page,'IDENTIFICADOR DE CONSTANCIA',294,81,5.8,bold,muted);k.lines(page,data.certificateCode,294,66,6.5,278,regular,wine,9);}write(page,'Autenticidad y vigencia mediante el QR.',294,47,6.3,regular,muted);
 qr(page,data.validationUrl||campusAddress,662,45,80);write(page,data.validationUrl?'VERIFICAR CONSTANCIA':'ACCESO AL CAMPUS',659,35,5.8,bold,muted);center(page,data.demo?'MUESTRA DE PRUEBA · SIN VALIDEZ ACADÉMICA':'Documento institucional emitido a partir del registro autorizado.',12,5.8,720,regular,muted,cx);return pdf.save();
}
