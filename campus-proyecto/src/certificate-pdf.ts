import {studentMatricula} from './student-identity';
import {createDocumentKit,documentColors,documentDate,documentDuration} from './report-pdf';
import {campusAddress} from './credential-contact';
export async function createCompletionCertificatePDF(data:any):Promise<Uint8Array>{
 const s=data.student||{},issuedAt=data.issuedAt||new Date().toISOString(),k=await createDocumentKit('Constancia de finalización - '+String(studentMatricula(s)||'Evolva Academy'),issuedAt);
 const {pdf,regular,bold,serif,write,brand,center,ornament,qr,sign}=k,{wine,gold,muted,border,white}=documentColors;
 pdf.setSubject('Constancia de finalización emitida por Evolva Academy');
 const page=pdf.addPage([841.89,595.28]),cx=420.945;
 page.drawRectangle({x:21,y:21,width:799.89,height:553.28,borderColor:gold,borderWidth:.7});page.drawRectangle({x:28,y:28,width:785.89,height:539.28,borderColor:border,borderWidth:.45});
 page.drawRectangle({x:21,y:478,width:5,height:96,color:wine});page.drawRectangle({x:795,y:21,width:26,height:113,color:wine});ornament(page,799,27,100,17,white,.45);
 page.drawRectangle({x:51,y:509,width:151,height:51,color:wine});brand(page,59,514,135);write(page,'EVOLVA ACADEMY',584,545,10,bold,wine);write(page,'FORMACIÓN CONTINUA',584,529,7,regular,muted);write(page,'APRENDER. EVOLUCIONAR. AVANZAR.',584,515,5.8,regular,muted);
 page.drawLine({start:{x:51,y:492},end:{x:790,y:492},color:border,thickness:.6});
 center(page,'Evolva Academy otorga la presente',461,11,680,regular,muted,cx);
 center(page,'CONSTANCIA',407,49,710,serif,wine,cx);center(page,'DE FINALIZACIÓN',384,8.5,680,bold,muted,cx);
 const nameHeight=center(page,s.name||'Alumno',340,26,670,bold,wine,cx,2),nameBottom=340-nameHeight+11;
 page.drawLine({start:{x:165,y:nameBottom-7},end:{x:677,y:nameBottom-7},color:gold,thickness:.55});
 const introY=nameBottom-31;center(page,'Por haber concluido satisfactoriamente el curso',introY,10.5,680,regular,muted,cx);
 const courseY=introY-30,used=center(page,s.course||'Curso',courseY,22,670,bold,wine,cx,2),detailsY=Math.min(201,courseY-used-8),duration=documentDuration(data);
 center(page,[s.modality||'En línea',duration==='No registrada'?'':duration,'Grupo '+(s.group||'por asignar')].filter(Boolean).join('  ·  '),detailsY,9.7,680,regular,muted,cx);
 center(page,'Matrícula '+(studentMatricula(s)||'No registrada')+'   ·   Promedio '+(data.average==null?'pendiente':data.average+' / 10'),detailsY-21,9,680,bold,wine,cx);
 center(page,'Se expide el '+documentDate(issuedAt)+'.',133,9.5,650,regular,muted,cx);
 sign(page,63,65);write(page,'Firma tipográfica institucional',63,35,6,regular,muted);
 if(data.certificateCode){write(page,'IDENTIFICADOR DE CONSTANCIA',309,81,6,bold,muted);write(page,data.certificateCode,309,66,6.8,regular,wine);}
 write(page,'Consulta la autenticidad y vigencia con el QR.',309,48,6.7,regular,muted);
 qr(page,data.validationUrl||campusAddress,688,43,80);write(page,data.validationUrl?'VERIFICAR CONSTANCIA':'ACCESO AL CAMPUS',686,33,5.8,bold,muted);
 center(page,data.demo?'MUESTRA DE PRUEBA · SIN VALIDEZ ACADÉMICA':'Documento institucional emitido a partir del registro autorizado.',11,5.6,720,regular,data.demo?gold:muted,cx);
 return pdf.save();
}
