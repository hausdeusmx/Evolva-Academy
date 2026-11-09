import {studentMatricula} from './student-identity';
import {pushGraphicsState,popGraphicsState,rectangle,clip,endPath} from 'pdf-lib';
import {createDocumentKit,documentColors,documentDate,wrapDocumentText} from './report-pdf';
import {credentialContact,credentialCurp,campusAddress} from './credential-contact';

export async function createCredentialPDF(data:any):Promise<Uint8Array>{
 if(!data.photo||!['image/png','image/jpeg'].includes(data.photo.mime))throw Error('La credencial requiere una fotografía JPG o PNG.');
 const k=await createDocumentKit('Credencial de alumno - '+studentMatricula(data.student),data.issuedAt),{pdf,regular,bold,write,lines,brand,qr,ornament}=k,{wine,muted,rose,gold,white,border}=documentColors;
 pdf.setSubject('Credencial escolar de uso académico');
 const bytes=Uint8Array.from(atob(data.photo.base64),c=>c.charCodeAt(0)),photo=data.photo.mime==='image/png'?await pdf.embedPng(bytes):await pdf.embedJpg(bytes);
 const width=243.78,height=153.07,front=pdf.addPage([width,height]),back=pdf.addPage([width,height]),s=data.student,contact=credentialContact(s);
 const fit=(page:any,value:unknown,x:number,y:number,size:number,w:number,max=2,font=regular,color=documentColors.ink)=>{while(wrapDocumentText(value,font,size,w).length>max&&size>4.1)size-=.15;if(wrapDocumentText(value,font,size,w).length>max)throw Error('Los datos exceden el espacio de la credencial. Solicita revisión a administración.');return lines(page,value,x,y,size,w,font,color,size*1.25);};
 front.drawRectangle({x:0,y:0,width:87,height,color:wine});ornament(front,62,0,154,21,white,.09);brand(front,9,120,69);
 front.drawRectangle({x:11,y:26,width:64,height:82,color:white});
 const scale=Math.max(60/photo.width,78/photo.height);front.pushOperators(pushGraphicsState(),rectangle(13,28,60,78),clip(),endPath());front.drawImage(photo,{x:13+(60-photo.width*scale)/2,y:28+(78-photo.height*scale)/2,width:photo.width*scale,height:photo.height*scale});front.pushOperators(popGraphicsState());
 write(front,'CREDENCIAL DE ESTUDIANTE',98,137,5.1,bold,muted);front.drawLine({start:{x:98,y:130},end:{x:232,y:130},color:gold,thickness:.7});
 fit(front,s.name,98,116,9.5,134,3,bold,wine);
 write(front,'CURSO',98,84,4.8,bold,muted);fit(front,s.course,98,74,6,134,2);
 write(front,'MATRÍCULA',98,54,4.8,bold,muted);fit(front,studentMatricula(s),98,42,8.5,134,1,bold,wine);
 write(front,'CURP',98,31,4.8,bold,muted);fit(front,credentialCurp(s)||'No registrada',98,21,6.4,134,1,bold,wine);
 write(front,'EVOLVA',12,14,5.8,bold,white);write(front,'ACADEMY',12,6,4.5,regular,white);
 front.drawRectangle({x:87,y:0,width:157,height:17,color:rose});fit(front,'GRUPO '+(s.group||'Por asignar'),98,7,5,81,1,bold,wine);fit(front,s.status||'Sin estado',185,7,4.5,47,1,bold,wine);
 if(data.demo)write(front,'MUESTRA',171,146,4.3,bold,gold);
 back.drawRectangle({x:0,y:123,width,height:31,color:wine});write(back,'EVOLVA ACADEMY',12,140,7.4,bold,white);write(back,'IDENTIDAD ACADÉMICA / DATOS DE CONTACTO',12,129,4.8,regular,white);ornament(back,218,125,24,13,white,.6);
 write(back,'CORREO INSTITUCIONAL',12,111,4.8,bold,muted);fit(back,contact.institutional,12,100,6.6,219,2);
 write(back,'TELÉFONO',12,81,4.8,bold,muted);fit(back,contact.phone,12,71,6.5,142,1);
 write(back,'EMISIÓN',12,55,4.8,bold,muted);write(back,documentDate(data.issuedAt),12,45,6.2);
 write(back,'VIGENCIA',12,32,4.8,bold,muted);fit(back,s.validThrough?documentDate(s.validThrough):'Sujeta a inscripción activa',12,22,5.5,142,1);
 qr(back,campusAddress,171,31,64);write(back,'ACCESO AL CAMPUS',169,23,4.8,bold,muted);
 back.drawLine({start:{x:12,y:16},end:{x:232,y:16},color:border,thickness:.4});write(back,contact.school,12,8,4.8,bold,wine);
 write(back,data.demo?'MUESTRA · SIN VALIDEZ':'Uso académico. No es identificación oficial.',12,2,3.7,regular,muted);
 return pdf.save();
}
