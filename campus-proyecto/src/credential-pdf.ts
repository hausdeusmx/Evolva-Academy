import {studentMatricula} from './student-identity';
import {pushGraphicsState,popGraphicsState,rectangle,clip,endPath} from 'pdf-lib';
import {createDocumentKit,documentColors,documentDate,wrapDocumentText} from './report-pdf';
import {credentialContact,campusAddress} from './credential-contact';

export async function createCredentialPDF(data:any):Promise<Uint8Array>{
 if(!data.photo||!['image/png','image/jpeg'].includes(data.photo.mime))throw Error('La credencial requiere una fotografía JPG o PNG.');
 const k=await createDocumentKit('Credencial de alumno - '+studentMatricula(data.student),data.issuedAt),{pdf,regular,bold,write,lines,brand,qr}=k,{wine,muted,rose,gold,white}=documentColors;
 pdf.setSubject('Credencial escolar de uso académico');
 const bytes=Uint8Array.from(atob(data.photo.base64),c=>c.charCodeAt(0)),photo=data.photo.mime==='image/png'?await pdf.embedPng(bytes):await pdf.embedJpg(bytes);
 const width=243.78,height=153.07,front=pdf.addPage([width,height]),back=pdf.addPage([width,height]),student=data.student,contact=credentialContact(student);
 const fit=(page:any,value:unknown,x:number,y:number,size:number,width:number,max=2,font=regular,color=documentColors.ink)=>{while(wrapDocumentText(value,font,size,width).length>max&&size>4.1)size-=.2;return lines(page,value,x,y,size,width,font,color,size+1.4);};
 front.drawRectangle({x:0,y:113,width,height:41,color:wine});brand(front,12,118,100);write(front,'CREDENCIAL',159,136,6,bold,white);write(front,'DE ESTUDIANTE',159,126,5,regular,white);front.drawRectangle({x:0,y:110,width,height:3,color:gold});front.drawRectangle({x:12,y:32,width:57,height:72,color:rose});
 const scale=Math.max(57/photo.width,72/photo.height);front.pushOperators(pushGraphicsState(),rectangle(12,32,57,72),clip(),endPath());front.drawImage(photo,{x:12+(57-photo.width*scale)/2,y:32+(72-photo.height*scale)/2,width:photo.width*scale,height:photo.height*scale});front.pushOperators(popGraphicsState());
 const nameHeight=fit(front,student.name,79,96,10,152,3,bold,wine);fit(front,student.course,79,Math.min(68,96-nameHeight-8),6.6,152,2);write(front,'MATRÍCULA',79,42,4.8,bold,muted);write(front,studentMatricula(student),79,29,8.6,bold,wine);
 front.drawRectangle({x:0,y:0,width,height:22,color:rose});fit(front,'GRUPO '+(student.group||'Por asignar'),12,12,5.4,128,1,bold,wine);fit(front,student.status||'Estado no registrado',155,12,5.4,76,1,bold,wine);if(data.demo)write(front,'MUESTRA · SIN VALIDEZ ACADÉMICA',12,3,4,bold,gold);
 back.drawRectangle({x:0,y:132,width,height:22,color:wine});write(back,'EVOLVA ACADEMY / IDENTIDAD ACADÉMICA',12,141,6,bold,white);write(back,'CORREO INSTITUCIONAL',12,119,4.8,bold,muted);fit(back,contact.institutional,12,108,6.1,220,2);
 write(back,'TELÉFONO DEL ALUMNO',12,88,4.8,bold,muted);fit(back,contact.phone,12,78,6.3,145,1);write(back,'FECHA DE EMISIÓN',12,64,4.8,bold,muted);write(back,documentDate(data.issuedAt),12,54,6.3);
 write(back,'VIGENCIA',12,41,4.8,bold,muted);fit(back,student.validThrough?documentDate(student.validThrough):'Sujeta a inscripción activa',12,31,5.7,145,1);qr(back,campusAddress,174,38,57);write(back,'ACCESO AL CAMPUS',171,30,4.7,bold,muted);
 write(back,contact.school,12,18,5.5,bold,wine);write(back,data.demo?'DATOS FICTICIOS · DOCUMENTO DE PRUEBA':'Uso personal y académico. No sustituye una identificación oficial.',12,7,4.3,regular,muted);
 return pdf.save();
}
