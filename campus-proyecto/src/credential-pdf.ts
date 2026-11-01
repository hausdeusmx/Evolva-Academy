import {PDFDocument,StandardFonts,rgb,pushGraphicsState,popGraphicsState,rectangle,clip,endPath,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import qrcode from 'qrcode-generator';
import {reportFonts} from './report-fonts';
import {logoJpegBase64} from './brand';
const wine=rgb(.31,.047,.09),ink=rgb(.23,.15,.18),muted=rgb(.47,.39,.42),rose=rgb(.965,.93,.94),white=rgb(1,1,1);
const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
function lines(value:string,font:PDFFont,size:number,width:number){const out:string[]=[];let current='';for(const word of String(value).trim().split(/\s+/)){if(font.widthOfTextAtSize((current?current+' ':'')+word,size)>width&&current){out.push(current);current='';}for(const ch of word){if(font.widthOfTextAtSize(current+ch,size)>width){out.push(current);current='';}current+=ch;}current+=' ';}if(current.trim())out.push(current.trim());return out;}
export async function createCredentialPDF(data:any):Promise<Uint8Array>{
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);pdf.setTitle('Credencial de alumno - '+data.student.folio);pdf.setAuthor('Evolva Academy');pdf.setSubject('Credencial escolar de uso académico');pdf.setCreationDate(new Date(data.issuedAt));
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),signature=await pdf.embedFont(StandardFonts.TimesRomanItalic),logo=await pdf.embedJpg(bytes(logoJpegBase64)),photo=data.photo.mime==='image/png'?await pdf.embedPng(bytes(data.photo.base64)):await pdf.embedJpg(bytes(data.photo.base64));
 const width=243.78,height=153.07,front=pdf.addPage([width,height]),back=pdf.addPage([width,height]);
 const write=(page:any,text:string,x:number,y:number,size=7,font=regular,color=ink)=>page.drawText(String(text),{x,y,size,font,color});
 front.drawRectangle({x:0,y:0,width,height,color:white});front.drawRectangle({x:0,y:111,width,height:43,color:wine});
 const scale=100/1840;front.pushOperators(pushGraphicsState(),rectangle(10,117,100,30),clip(),endPath());front.drawImage(logo,{x:10-110*scale,y:117+(720+620)*scale-2048*scale,width:2048*scale,height:2048*scale});front.pushOperators(popGraphicsState());
 write(front,'CREDENCIAL',155,135,7,bold,white);write(front,'DE ALUMNO',155,124,7,regular,white);
 front.drawRectangle({x:12,y:31,width:53,height:70,color:white,borderColor:rgb(.87,.82,.84),borderWidth:.6});const fit=photo.scaleToFit(49,66);front.drawImage(photo,{x:14+(49-fit.width)/2,y:33+(66-fit.height)/2,width:fit.width,height:fit.height});
 write(front,'ALUMNO/A',76,98,5,regular,muted);let fontSize=10.3;while(lines(data.student.name,bold,fontSize,154).length>3&&fontSize>5.5)fontSize-=.3;
 const nameLines=lines(data.student.name,bold,fontSize,154).slice(0,3);nameLines.forEach((line,i)=>write(front,line,76,85-i*(fontSize+1),fontSize,bold));
 write(front,'DIPLOMADO',76,57,5,regular,muted);lines(data.student.course,regular,7,154).slice(0,2).forEach((line,i)=>write(front,line,76,47-i*8,7));
 write(front,'GRUPO',150,25,5,regular,muted);write(front,data.student.group||'Por asignar',150,15.8,7,bold);
 write(front,'FOLIO',12,25,5,regular,muted);write(front,data.student.folio,12,15.8,7.2,bold,wine);front.drawRectangle({x:0,y:0,width,height:11,color:rose});write(front,data.demo?'MUESTRA DE PRUEBA - SIN VALIDEZ':'EVOLVA ACADEMY · USO PERSONAL Y ACADÉMICO',12,3.3,5.2,bold,wine);
 back.drawRectangle({x:0,y:0,width,height,color:rose});back.drawRectangle({x:0,y:117,width,height:37,color:wine});write(back,'EVOLVA ACADEMY',13,136,11,bold,white);write(back,'APRENDER. EVOLUCIONAR. AVANZAR.',13,124,5.3,regular,white);
 const note='Credencial personal de uso académico, válida mientras la inscripción del alumno esté activa. Si la encuentras, comunícate con la administración de Evolva Academy.';
 lines(note,regular,6.1,217).forEach((line,i)=>write(back,line,13,104-i*8,6.1));
 back.drawLine({start:{x:13,y:65},end:{x:148,y:65},thickness:.5,color:muted});write(back,'Alexis Soto',13,70,12,signature,wine);write(back,'Director General',13,55,6,bold);write(back,data.student.folio,13,38,7,bold,wine);
 const issued=new Date(data.issuedAt).toLocaleDateString('es-MX',{timeZone:'America/Ciudad_Juarez',year:'numeric',month:'2-digit',day:'2-digit'});write(back,'Emisión: '+issued,13,26,5.8);write(back,'evolvacademy.mx',13,15,6,bold);
 const qr=qrcode(0,'M');qr.addData('https://evolvacademy.mx/campus/','Byte');qr.make();const count=qr.getModuleCount(),step=39/count;back.drawRectangle({x:183,y:15,width:43,height:43,color:white});for(let r=0;r<count;r++)for(let c=0;c<count;c++)if(qr.isDark(r,c))back.drawRectangle({x:185+c*step,y:17+(count-r-1)*step,width:step+.03,height:step+.03,color:wine});write(back,'ACCESO AL CAMPUS',183,8,4.2,bold,wine);
 if(data.demo)write(back,'DATOS FICTICIOS · MUESTRA DE PRUEBA',13,3.5,4.7,bold,wine);
 return pdf.save();
}
