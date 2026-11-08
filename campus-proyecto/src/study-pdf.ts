import {studentMatricula} from './student-identity';
import {createDocumentKit,documentColors,documentDate,documentDuration,wrapDocumentText} from './report-pdf';
export async function createStudyLetterPDF(data:any):Promise<Uint8Array>{
 const k=await createDocumentKit('Constancia de estudios - Evolva Academy',data.issuedAt),{pdf,regular,bold,serif,write,lines,field,sign,qr,header,footer,ornament}=k,{wine,muted,border,gold}=documentColors,s=data.student||{},page=pdf.addPage([595.28,841.89]);
 header(page,'SERVICIOS ESCOLARES / INSCRIPCIÓN');ornament(page,510,235,380,28,wine,.06);
 write(page,'Constancia de estudios',40,689,27,serif,wine);write(page,'A QUIEN CORRESPONDA',40,657,8,bold,muted);
 if(data.demo)write(page,'MUESTRA · SIN VALIDEZ ACADÉMICA',40,638,7,bold,gold);
 write(page,'Por medio de la presente se hace constar que:',40,607,10.5,regular,muted);
 let size=20;while(wrapDocumentText(s.name||'Alumno',bold,size,515).length>2&&size>10)size-=.5;
 let y=574-lines(page,s.name||'Alumno',40,574,size,515,bold,wine,size*1.25)-8;
 write(page,'Matrícula '+studentMatricula(s),40,y,10,bold,wine);y-=37;
 y-=lines(page,'se encuentra inscrito/a en Evolva Academy en el curso indicado a continuación. Esta constancia acredita la inscripción registrada a la fecha de emisión.',40,y,10.5,515,regular,muted,16)+22;
 y-=Math.max(52,field(page,'Curso',s.course||'No registrado',40,y,515)+24);
 field(page,'Grupo',s.group||'Por asignar',40,y,240);field(page,'Modalidad / duración',(data.modality||s.modality||'En línea')+' / '+documentDuration(data),310,y,240);y-=49;
 field(page,'Inscripción',documentDate(s.registered),40,y,240);field(page,'Fecha de emisión',documentDate(data.issuedAt),310,y,240);y-=48;
 field(page,'Vigencia hasta',documentDate(data.expires),40,y,240);write(page,'La vigencia puede cambiar por cancelación de la inscripción.',40,y-42,7.5,regular,muted);
 page.drawLine({start:{x:40,y:206},end:{x:555,y:206},color:border,thickness:.7});sign(page,40,142);write(page,'Firma tipográfica institucional',40,113,6.5,regular,muted);
 qr(page,data.validationUrl||'https://evolvacademy.mx/validar-estudios.html',464,101,87);write(page,'VERIFICAR VIGENCIA',462,89,6.5,bold,muted);
 write(page,'Código: '+String(data.code||''),40,87,6.7,bold,wine);write(page,'Acredita la inscripción registrada; no la conclusión del curso.',40,70,7,regular,muted);
 footer(page,1,1,'Constancia de estudios');return pdf.save();
}
