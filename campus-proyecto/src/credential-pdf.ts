import {PDFDocument,StandardFonts,rgb,pushGraphicsState,popGraphicsState,rectangle,clip,endPath,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import qrcode from 'qrcode-generator';
import {reportFonts} from './report-fonts';
import {logoJpegBase64} from './brand';
import {credentialContact,campusAddress} from './credential-contact';
const wine=rgb(.314,.047,.09),ink=rgb(.20,.13,.15),muted=rgb(.43,.34,.37),rose=rgb(.965,.925,.935),border=rgb(.87,.79,.82),cream=rgb(.995,.99,.985),accent=rgb(.72,.48,.53);
const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
function lines(value:string,font:PDFFont,size:number,width:number){const out:string[]=[];let line='';for(const word of String(value).trim().split(/\\s+/)){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)<=width){line=next;continue;}if(line)out.push(line);line=word;}if(line)out.push(line);return out.length?out:[''];}
export async function createCredentialPDF(data:any):Promise<Uint8Array>{
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);pdf.setTitle('Credencial de alumno - '+data.student.folio);pdf.setAuthor('Evolva Academy');pdf.setSubject('Credencial escolar de uso académico');pdf.setCreationDate(new Date(data.issuedAt));
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),signature=await pdf.embedFont(StandardFonts.TimesRomanItalic),logo=await pdf.embedJpg(bytes(logoJpegBase64)),photo=data.photo.mime==='image/png'?await pdf.embedPng(bytes(data.photo.base64)):await pdf.embedJpg(bytes(data.photo.base64));
 const width=243.78,height=153.07,front=pdf.addPage([width,height]),back=pdf.addPage([width,height]),contact=credentialContact(data.student);
 const printable=(v:string)=>String(v??'').replace(/[\\u2013\\u2014]/g,'-').replace(/[^\\x20-\\xFF\\u20AC]/g,'');
 const write=(p:any,v:string,x:number,y:number,size=7,font=regular,color=ink)=>p.drawText(printable(v),{x,y,size,font,color});
 const fit=(p:any,v:string,x:number,y:number,size:number,w:number,max:number,font=regular,color=ink)=>{let s=size;while(lines(v,font,s,w).length>max&&s>4.5)s-=.2;lines(v,font,s,w).slice(0,max).forEach((t,i)=>write(p,t,x,y-i*(s+1.7),s,font,color));};
 // FRONT: editorial split, photo window and oversized identity number.
 front.drawRectangle({x:0,y:0,width,height,color:cream});front.drawRectangle({x:0,y:0,width:82,height,color:wine});front.drawRectangle({x:82,y:0,width:3,height,color:accent});
 front.drawImage(logo,{x:13,y:height-42,width:56,height:30});
 front.drawRectangle({x:12,y:35,width:58,height:70,color:white,borderColor:accent,borderWidth:.8});
 const pf=photo.scaleToFit(54,66);front.drawImage(photo,{x:14+(54-pf.width)/2,y:37+(66-pf.height)/2,width:pf.width,height:pf.height});
 write(front,'ALUMNO/A',96,132,5,bold,muted);fit(front,data.student.name,96,116,11,136,2,bold,wine);
 write(front,'PROGRAMA',96,79,5,bold,muted);fit(front,data.student.course,96,67,7,136,2,regular,ink);
 write(front,'MATRÍCULA',96,36,5,bold,muted);write(front,data.student.folio,96,22,9,bold,wine);
 write(front,'GRUPO',190,36,5,bold,muted);fit(front,data.student.group||'Por asignar',190,22,7,42,1,bold,wine);
 write(front,data.demo?'MUESTRA':'IDENTIFICACIÓN ACADÉMICA',13,19,4.4,bold,white);
 // BACK: no header band; information arranged around a large QR module.
 back.drawRectangle({x:0,y:0,width,height,color:cream});back.drawRectangle({x:0,y:height-5,width,height:5,color:accent});back.drawRectangle({x:0,y:0,width:7,height,color:wine});
 write(back,'EVOLVA ACADEMY',17,130,11,bold,wine);write(back,'DATOS DE CONTACTO',17,117,5,bold,muted);
 write(back,'CORREO INSTITUCIONAL',17,98,4.7,bold,muted);fit(back,contact.institutional,17,87,6.4,133,2,bold,ink);
 write(back,'TELÉFONO',17,63,4.7,bold,muted);fit(back,contact.phone,17,52,7.5,133,1,bold,wine);
 write(back,'ESCUELA',17,35,4.7,bold,muted);fit(back,contact.school,17,24,6.4,133,1,regular,ink);
 const qr=qrcode(0,'M');qr.addData(campusAddress,'Byte');qr.make();const n=qr.getModuleCount(),step=42/n,left=178,bottom=65;
 back.drawRectangle({x:left-5,y:bottom-5,width:52,height:52,color:white,borderColor:border,borderWidth:.5});
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))back.drawRectangle({x:left+c*step,y:bottom+(n-r-1)*step,width:step+.02,height:step+.02,color:wine});
 write(back,'MI CAMPUS',184,57,4.5,bold,wine);
 write(back,'Alexis Soto',17,8,7,signature,wine);write(back,'DIRECCIÓN GENERAL',64,9,4.4,bold,muted);
 const issued=new Date(data.issuedAt).toLocaleDateString('es-MX',{timeZone:'America/Ciudad_Juarez',year:'numeric',month:'2-digit',day:'2-digit'});write(back,issued,178,18,5.2,bold,muted);
 return pdf.save();
}