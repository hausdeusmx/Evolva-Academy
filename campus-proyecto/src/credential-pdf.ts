import {PDFDocument,StandardFonts,rgb,pushGraphicsState,popGraphicsState,rectangle,clip,endPath,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import qrcode from 'qrcode-generator';
import {reportFonts} from './report-fonts';
import {logoJpegBase64} from './brand';
import {credentialContact,campusAddress} from './credential-contact';
const wine=rgb(.055,.12,.22),ink=rgb(.10,.17,.24),muted=rgb(.36,.45,.52),rose=rgb(.91,.96,.97),cream=rgb(.995,.999,1),white=rgb(1,1,1),accent=rgb(.08,.62,.66);
const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
function lines(value:string,font:PDFFont,size:number,width:number){const out:string[]=[];let current='';for(const word of String(value).trim().split(/\s+/)){const candidate=current?current+' '+word:word;if(font.widthOfTextAtSize(candidate,size)<=width){current=candidate;continue;}if(current){out.push(current);current='';}for(const ch of word){if(font.widthOfTextAtSize(current+ch,size)>width){out.push(current);current='';}current+=ch;}}if(current)out.push(current);return out;}
export async function createCredentialPDF(data:any):Promise<Uint8Array>{
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);pdf.setTitle('Credencial de alumno - '+data.student.folio);pdf.setAuthor('Evolva Academy');pdf.setSubject('Credencial escolar de uso académico');pdf.setCreationDate(new Date(data.issuedAt));
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),signature=await pdf.embedFont(StandardFonts.TimesRomanItalic),logo=await pdf.embedJpg(bytes(logoJpegBase64)),photo=data.photo.mime==='image/png'?await pdf.embedPng(bytes(data.photo.base64)):await pdf.embedJpg(bytes(data.photo.base64));
 const width=243.78,height=153.07,front=pdf.addPage([width,height]),back=pdf.addPage([width,height]),contact=credentialContact(data.student);
 const printable=(text:string)=>String(text??'').replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\xFF\u20AC]/g,'');
 const write=(page:any,text:string,x:number,y:number,size=7,font=regular,color=ink)=>page.drawText(printable(text),{x,y,size,font,color});
 const fitted=(page:any,text:string,x:number,y:number,size:number,maxWidth:number,maxLines:number,font=regular,color=ink)=>{let fittedSize=size;while(lines(text,font,fittedSize,maxWidth).length>maxLines&&fittedSize>4.5)fittedSize-=.2;const wrapped=lines(text,font,fittedSize,maxWidth);if(wrapped.length>maxLines)throw Error('El texto de la credencial excede el espacio disponible. Solicita revisar tus datos.');wrapped.forEach((s,i)=>write(page,s,x,y-i*(fittedSize+1.8),fittedSize,font,color));};
 front.drawRectangle({x:0,y:0,width,height,color:cream});front.drawRectangle({x:0,y:height-3,width,height:3,color:accent});front.drawRectangle({x:0,y:113,width,height:41,color:wine});front.drawRectangle({x:0,y:110,width,height:3,color:accent});front.drawRectangle({x:0,y:0,width:5,height,color:wine});
 const scale=103/1840;front.pushOperators(pushGraphicsState(),rectangle(11,117,103,32),clip(),endPath());front.drawImage(logo,{x:11-110*scale,y:114.5+(720+620)*scale-2048*scale,width:2048*scale,height:2048*scale});front.pushOperators(popGraphicsState());
 write(front,'CREDENCIAL',159,136,6.4,bold,white);write(front,'DE ALUMNO',159,125,6.4,regular,white);
 front.drawRectangle({x:12,y:37,width:52,height:68,color:white,borderColor:rgb(.85,.78,.80),borderWidth:.65});const fit=photo.scaleToFit(48,64);front.drawImage(photo,{x:14+(48-fit.width)/2,y:39+(64-fit.height)/2,width:fit.width,height:fit.height});
 write(front,'ALUMNO/A',76,103,4.8,bold,muted);fitted(front,data.student.name,76,91,10.2,155,3,bold);
 write(front,'CURSO',76,60,4.8,bold,muted);fitted(front,data.student.course,76,49,7,155,2);
 front.drawLine({start:{x:12,y:33},end:{x:231,y:33},thickness:.8,color:accent});
 write(front,'MATRÍCULA',12,25,4.4,bold,muted);write(front,data.student.folio,12,15,7.5,bold,wine);
 write(front,'GRUPO',158,25,4.4,bold,muted);fitted(front,data.student.group||'Por asignar',158,15,7.2,73,1,bold,wine);
 front.drawRectangle({x:0,y:0,width,height:10,color:wine});write(front,data.demo?'MUESTRA DE PRUEBA - SIN VALIDEZ':'EVOLVA ACADEMY · IDENTIDAD ACADÉMICA',12,3.1,4.6,bold,white);
 back.drawRectangle({x:0,y:0,width,height,color:cream});back.drawRectangle({x:0,y:height-3,width,height:3,color:accent});back.drawRectangle({x:0,y:122,width,height:32,color:wine});back.drawRectangle({x:0,y:0,width:5,height,color:wine});back.drawRectangle({x:12,y:117,width:219,height:1,color:accent});write(back,'EVOLVA ACADEMY',12,137,10,bold,white);write(back,'CONTACTO Y ACCESO AL CAMPUS',12,127,4.8,regular,white);
 write(back,'CORREO INSTITUCIONAL',12,111,4.8,bold,muted);fitted(back,contact.institutional,12,100,7.1,160,2,bold,wine);
 write(back,'TELÉFONO DEL ALUMNO',12,79,4.8,bold,muted);fitted(back,contact.phone,12,67,9,160,1,bold,ink);
 write(back,'CONTACTO DE LA ESCUELA',12,51,4.8,bold,muted);write(back,contact.school,12,40,7.2,bold,wine);
 const qr=qrcode(0,'M');qr.addData(campusAddress,'Byte');qr.make();const count=qr.getModuleCount(),step=37/count;
 back.drawRectangle({x:184,y:67,width:43,height:43,color:white});for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))back.drawRectangle({x:187+c*step,y:70+(count-r-1)*step,width:step+.02,height:step+.02,color:wine});write(back,'MI CAMPUS',191,60,4.5,bold,wine);
 back.drawLine({start:{x:12,y:32},end:{x:231,y:32},thickness:.8,color:accent});write(back,'Alexis Soto',12,20,9.5,signature,wine);write(back,'Director General',12,11,4.8,bold);
 const issued=new Date(data.issuedAt).toLocaleDateString('es-MX',{timeZone:'America/Ciudad_Juarez',year:'numeric',month:'2-digit',day:'2-digit'});write(back,'EMISIÓN',169,23,4.2,bold,muted);write(back,issued,169,13,6.3);
 write(back,data.demo?'DATOS FICTICIOS · MUESTRA DE PRUEBA':'USO PERSONAL Y ACADÉMICO · INSCRIPCIÓN ACTIVA',12,3.1,4.2,regular,muted);
 return pdf.save();
}
