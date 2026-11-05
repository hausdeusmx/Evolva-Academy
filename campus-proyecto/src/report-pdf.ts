import {PDFDocument,StandardFonts,rgb,PDFString,pushGraphicsState,popGraphicsState,rectangle,clip,endPath,type PDFFont} from 'pdf-lib';
import qrcode from 'qrcode-generator';
import fontkit from '@pdf-lib/fontkit';
import {reportFonts} from './report-fonts.ts';
import {logoJpegBase64} from './brand.ts';
import {REPORT_TITLE} from './report-record.ts';
const wine=rgb(.314,.047,.09),ink=rgb(.20,.13,.15),muted=rgb(.43,.34,.37),rose=rgb(.965,.925,.935),border=rgb(.87,.79,.82),cream=rgb(.995,.99,.985),accent=rgb(.72,.48,.53);
export function qrMatrix(url:string){const qr=qrcode(0,'M');qr.addData(url,'Byte');qr.make();const n=qr.getModuleCount();return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>qr.isDark(r,c)));}
function wrap(value:string,font:PDFFont,size:number,width:number){const words=value.replace(/\s+/g,' ').trim().split(' '),lines:string[]=[];let line='';for(const word of words){if(font.widthOfTextAtSize((line?line+' ':'')+word,size)<=width){line+=(line?' ':'')+word;continue;}if(line)lines.push(line);line='';for(const char of word){if(font.widthOfTextAtSize(line+char,size)>width){lines.push(line);line='';}line+=char;}}if(line)lines.push(line);return lines.length?lines:[''];}
function printable(value:string){return value.replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\xFF\u20AC]/g,'');}
export async function createAcademicReportPDF(data:any,meta:{code:string,issuedAt:string,validationUrl:string}){
 const pdf=await PDFDocument.create();pdf.setTitle(REPORT_TITLE);pdf.setAuthor('Evolva Academy');pdf.setSubject('Reporte académico emitido por Evolva Academy');pdf.setCreator('Evolva Academy · Campus privado');pdf.setCreationDate(new Date(meta.issuedAt));
 pdf.registerFontkit(fontkit);
 const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),signature=await pdf.embedFont(StandardFonts.TimesRomanItalic),logo=await pdf.embedJpg(Uint8Array.from(atob(logoJpegBase64),c=>c.charCodeAt(0)));const qr=qrMatrix(meta.validationUrl),pages:any[]=[];let page:any,y=0;
 const write=(s:string,x:number,baseline:number,size=10,font=regular,color=ink)=>page.drawText(printable(String(s)),{x,y:baseline,size,font,color});
 function header(first:boolean){page=pdf.addPage([595.28,841.89]);pages.push(page);page.drawRectangle({x:0,y:0,width:595.28,height:841.89,color:cream});page.drawRectangle({x:0,y:835,width:595.28,height:7,color:accent});page.drawRectangle({x:0,y:687,width:595.28,height:155,color:wine});page.pushOperators(pushGraphicsState(),rectangle(44,740,210,70.76),clip(),endPath());
 // Clip the untouched square logo to its original wordmark region.
 const scale=210/1840;page.drawImage(logo,{x:44-110*scale,y:740+(720+620)*scale-2048*scale,width:2048*scale,height:2048*scale});
 page.pushOperators(popGraphicsState());
 write('EVOLVA ACADEMY',44,714,9,bold,rgb(1,1,1));write('CAMPUS VIRTUAL  /  SERVICIOS ESCOLARES',44,699,7,regular,rgb(.96,.88,.90));page.drawCircle({x:535,y:760,size:34,color:rgb(.40,.10,.15),opacity:.65});page.drawCircle({x:535,y:760,size:25,borderColor:accent,borderWidth:1,opacity:.85});page.drawRectangle({x:44,y:660,width:507,height:1.5,color:accent});
 write('DOCUMENTO ACADÉMICO',44,624,8,bold,muted);write('BOLETA DE CALIFICACIONES',44,594,22,bold,wine);if(data.demo)write('DOCUMENTO DE PRUEBA - SIN VALIDEZ ACADÉMICA',44,573,8,bold,rgb(.58,.34,.13));
 if(first){write('ALUMNO/A',44,546,7,bold,muted);const names=wrap(printable(data.student.name),bold,19,507);names.forEach((line,i)=>write(line,44,521-i*22,19,bold));let base=names.length>1?477:497;write('MATRÍCULA',44,base,7,bold,muted);write(data.student.folio,44,base-16,11,bold);write('GRUPO',349,base,7,bold,muted);write(data.student.group,349,base-16,10);const courses=wrap(printable(data.student.course),regular,10,507);courses.forEach((line,i)=>write(line,44,base-40-i*13,10));y=base-65-(courses.length-1)*13;}
 else {write(data.student.name,44,546,12,bold);write(`Matrícula ${data.student.folio}  |  ${data.student.course}`,44,526,9);y=500;}
 page.drawRectangle({x:44,y:y-10,width:507,height:27,color:rose});page.drawRectangle({x:44,y:y-10,width:3,height:27,color:wine});write('MÓDULO / EVALUACIÓN',56,y,8,bold,wine);write('CALIFICACIÓN',448,y,8,bold,wine);y-=35;
 }
 function footer(){page.drawLine({start:{x:44,y:202},end:{x:551,y:202},thickness:.7,color:border});write('DIRECCIÓN GENERAL',44,181,7,bold,muted);write('Alexis Soto',44,151,25,signature,wine);page.drawLine({start:{x:44,y:139},end:{x:227,y:139},thickness:.6,color:border});write('Alexis Soto',44,122,10,bold);write('Director General',44,107,9);write('Evolva Academy',44,93,8,regular,muted);
 const count=qr.length+8,size=92,cell=size/count,left=459,bottom=91;page.drawRectangle({x:left,y:bottom,width:size,height:size,color:rgb(1,1,1)});qr.forEach((row,r)=>row.forEach((dark,c)=>{if(dark)page.drawRectangle({x:left+(c+4)*cell,y:bottom+(qr.length-r+3)*cell,width:cell+.01,height:cell+.01,color:rgb(0,0,0)});}));write('VALIDAR DOCUMENTO',457,79,7,bold,muted);
 write('Consulta el registro de emisión en el portal privado.',44,73,8,regular,muted);write('Código: '+meta.code,44,58,7,regular,muted);const date=new Date(meta.issuedAt).toLocaleString('es-MX',{timeZone:'America/Ciudad_Juarez',dateStyle:'medium',timeStyle:'short'});write('Emitido: '+date,44,37,8,regular,muted);write(data.demo?'Registro de prueba con datos ficticios.':'Este reporte refleja las calificaciones registradas a la fecha de emisión.',44,22,7,regular,muted);
 const link=pdf.context.register(pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[455,74,553,185],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(meta.validationUrl)}}));page.node.addAnnot(link);
 }
 header(true);
 for(const grade of data.grades){const moduleLines=wrap(printable(grade.module),regular,7.5,380),titleLines=wrap(printable(grade.title),regular,9,380),height=moduleLines.length*10+titleLines.length*12+15;if(y-height<242){footer();header(false);}moduleLines.forEach((line:string,i:number)=>write(line,54,y-i*10,7.5,regular,muted));const titleY=y-moduleLines.length*10-3;titleLines.forEach((line:string,i:number)=>write(line,54,titleY-i*12,9));const score=grade.score===null?'Pendiente':`${grade.score} / 10`;write(score,grade.score===null?463:477,y-13,9,grade.score===null?regular:bold);y-=height;page.drawLine({start:{x:44,y:y+12},end:{x:551,y:y+12},thickness:.4,color:border});}
 if(y<235){footer();header(false);}page.drawRectangle({x:44,y:y-28,width:507,height:42,color:rose});write('PROMEDIO GENERAL',56,y-12,8,bold,muted);write(data.average===null?'Sin calificaciones':`${data.average} / 10`,440,y-15,16,bold,wine);footer();pages.forEach((p,i)=>{page=p;write(`Página ${i+1} de ${pages.length}`,474,37,8,regular,muted);});return pdf.save();
}
