import {studentMatricula} from './student-identity';
import {pushGraphicsState,popGraphicsState,rectangle,clip,endPath} from 'pdf-lib';
import {createDocumentKit,documentColors,documentDate,wrapDocumentText} from './report-pdf';
import {credentialContact,credentialCurp,campusAddress} from './credential-contact';
export async function createCredentialPDF(data:any):Promise<Uint8Array>{
 if(!data.photo||!['image/png','image/jpeg'].includes(data.photo.mime))throw Error('La credencial requiere una fotografía JPG o PNG.');
 const k=await createDocumentKit('Credencial de alumno - '+studentMatricula(data.student),data.issuedAt),{pdf,regular,bold,write,lines,brand,qr}=k,{wine,muted,rose,gold,white,border}=documentColors;
 pdf.setSubject('Credencial escolar de uso académico');
 const bytes=Uint8Array.from(atob(data.photo.base64),c=>c.charCodeAt(0)),photo=data.photo.mime==='image/png'?await pdf.embedPng(bytes):await pdf.embedJpg(bytes),width=243.78,height=153.07,front=pdf.addPage([width,height]),back=pdf.addPage([width,height]),s=data.student,contact=credentialContact(s);
 const fit=(page:any,value:unknown,x:number,y:number,size:number,w:number,max=2,font=regular,color=documentColors.ink)=>{while(wrapDocumentText(value,font,size,w).length>max&&size>4.1)size-=.15;if(wrapDocumentText(value,font,size,w).length>max)throw Error('Los datos exceden el espacio de la credencial. Solicita revisión a administración.');return lines(page,value,x,y,size,w,font,color,size*1.25);};
 front.drawRectangle({x:0,y:117,width,height:36,color:wine});brand(front,13,121,87);write(front,'CREDENCIAL',164,139,6.1,bold,white);write(front,'DE ESTUDIANTE',164,129,4.8,regular,white);front.drawRectangle({x:0,y:0,width,height:4,color:wine});
 front.drawRectangle({x:12,y:22,width:66,height:83,color:rose,borderColor:border,borderWidth:.5});const scale=Math.max(62/photo.width,79/photo.height);front.pushOperators(pushGraphicsState(),rectangle(14,24,62,79),clip(),endPath());front.drawImage(photo,{x:14+(62-photo.width*scale)/2,y:24+(79-photo.height*scale)/2,width:photo.width*scale,height:photo.height*scale});front.pushOperators(popGraphicsState());
 fit(front,s.name,89,105,10,142,3,bold,wine);write(front,'CURSO',89,72,4.6,bold,muted);fit(front,s.course,89,62,6.1,142,2);
 write(front,'MATRÍCULA',89,42,4.6,bold,muted);fit(front,studentMatricula(s),89,31,8.4,142,1,bold,wine);write(front,'CURP',89,21,4.6,bold,muted);fit(front,credentialCurp(s)||'No registrada',89,11,6.1,142,1,bold,wine);
 fit(front,'GRUPO '+(s.group||'Por asignar'),12,12,4.7,66,2,bold,wine);if(data.demo)write(front,'MUESTRA',112,143,4.2,bold,gold);
 back.drawRectangle({x:0,y:123,width,height:30,color:wine});write(back,'EVOLVA ACADEMY',12,140,7.4,bold,white);write(back,'DATOS DE CONTACTO / USO ACADÉMICO',12,130,4.8,regular,white);
 write(back,'CORREO INSTITUCIONAL',12,111,4.8,bold,muted);fit(back,contact.institutional,12,100,6.6,219,2);
 write(back,'TELÉFONO',12,80,4.8,bold,muted);fit(back,contact.phone,12,70,6.5,142,1);
 write(back,'EMISIÓN',12,54,4.8,bold,muted);write(back,documentDate(data.issuedAt),12,44,6.2);write(back,'VIGENCIA',12,31,4.8,bold,muted);fit(back,s.validThrough?documentDate(s.validThrough):'Sujeta a inscripción activa',12,21,5.5,142,1);
 qr(back,campusAddress,168,30,64);write(back,'ACCESO AL CAMPUS',167,22,4.8,bold,muted);back.drawLine({start:{x:12,y:16},end:{x:232,y:16},color:border,thickness:.4});write(back,contact.school,12,8,4.8,bold,wine);write(back,data.demo?'MUESTRA · SIN VALIDEZ':'Uso académico. No es identificación oficial.',12,2,3.7,regular,muted);
 return pdf.save();
}
