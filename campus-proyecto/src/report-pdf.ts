import {PDFDocument,StandardFonts,rgb,PDFString,type PDFFont} from 'pdf-lib';
import qrcode from 'qrcode-generator';
import fontkit from '@pdf-lib/fontkit';
import {reportFonts} from './report-fonts.ts';
import {logoJpegBase64} from './brand.ts';
import {REPORT_TITLE} from './report-record.ts';
const wine=rgb(.314,.047,.09),ink=rgb(.20,.13,.15),muted=rgb(.43,.34,.37),rose=rgb(.965,.925,.935),border=rgb(.87,.79,.82),cream=rgb(.995,.99,.985),accent=rgb(.72,.48,.53);
export function qrMatrix(url:string){const qr=qrcode(0,'M');qr.addData(url,'Byte');qr.make();const n=qr.getModuleCount();return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>qr.isDark(r,c)));}
function wrap(value:string,font:PDFFont,size:number,width:number){const words=value.replace(/\\s+/g,' ').trim().split(' '),out:string[]=[];let line='';for(const word of words){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)<=width){line=next;continue;}if(line)out.push(line);line='';for(const ch of word){if(font.widthOfTextAtSize(line+ch,size)>width){if(line)out.push(line);line='';}line+=ch;}}if(line)out.push(line);return out.length?out:[''];}
function printable(value:string){return String(value??'').replace(/[\\u2013\\u2014]/g,'-').replace(/[^\\x20-\\xFF\\u20AC]/g,'');}
export async function createAcademicReportPDF(data:any,meta:{code:string,issuedAt:string,validationUrl:string}){
 const pdf=await PDFDocument.create();pdf.setTitle(REPORT_TITLE);pdf.setAuthor('Evolva Academy');pdf.setSubject('Reporte académico emitido por Evolva Academy');pdf.setCreator('Evolva Academy · Campus privado');pdf.setCreationDate(new Date(meta.issuedAt));pdf.registerFontkit(fontkit);
 const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),logo=await pdf.embedJpg(bytes(logoJpegBase64));
 const qr=qrMatrix(meta.validationUrl),pages:any[]=[];let page:any,y=0;
 const write=(s:string,x:number,base:number,size=10,font=regular,color=ink)=>page.drawText(printable(s),{x,y:base,size,font,color});
 function newPage(first:boolean){
  page=pdf.addPage([595.28,841.89]);pages.push(page);
  page.drawRectangle({x:0,y:0,width:595.28,height:841.89,color:cream});
  page.drawRectangle({x:0,y:0,width:17,height:841.89,color:wine});
  page.drawImage(logo,{x:43,y:758,width:91,height:65});
  write('EVOLVA ACADEMY',151,798,9,bold,wine);write('REGISTRO ACADÉMICO  /  CAMPUS VIRTUAL',151,782,7,regular,muted);
  page.drawLine({start:{x:43,y:744},end:{x:552,y:744},thickness:1,color:border});
  write('EXPEDIENTE',43,714,7,bold,muted);write('BOLETA',43,676,30,bold,wine);
  write('DE CALIFICACIONES',43,651,16,regular,ink);
  page.drawRectangle({x:448,y:674,width:104,height:48,color:rose});write('DOCUMENTO',460,703,6,bold,muted);write('ACADÉMICO',460,689,8,bold,wine);
  if(data.demo)write('MUESTRA · SIN VALIDEZ ACADÉMICA',43,631,7,bold,rgb(.58,.34,.13));
  if(first){
   const student=printable(data.student.name);const names=wrap(student,bold,16,500);names.slice(0,2).forEach((s,i)=>write(s,43,596-i*19,16,bold,ink));
   const rowY=names.length>1?548:565;
   page.drawRectangle({x:43,y:rowY-34,width:509,height:48,color:rose});
   write('MATRÍCULA',57,rowY,6,bold,muted);write(printable(data.student.folio),57,rowY-17,10,bold,wine);
   write('GRUPO',222,rowY,6,bold,muted);write(printable(data.student.group||'Sin asignar'),222,rowY-17,10,bold,ink);
   write('PROGRAMA',365,rowY,6,bold,muted);wrap(printable(data.student.course),regular,8,174).slice(0,2).forEach((s,i)=>write(s,365,rowY-17-i*10,8,regular,ink));
   y=rowY-58;
  }else{
   write(printable(data.student.name),43,585,11,bold,ink);
   write('MATRÍCULA  '+printable(data.student.folio)+'     ·     '+printable(data.student.course),43,565,8,regular,muted);y=526;
  }
  page.drawRectangle({x:43,y:y-12,width:509,height:27,color:wine});
  write('UNIDAD / ACTIVIDAD',56,y-3,7,bold,rgb(1,1,1));write('RESULTADO',455,y-3,7,bold,rgb(1,1,1));y-=33;
 }
 function footer(){
  page.drawRectangle({x:43,y:34,width:509,height:1,color:border});
  write('EMISIÓN',43,19,6,bold,muted);write(new Date(meta.issuedAt).toLocaleDateString('es-MX',{timeZone:'America/Ciudad_Juarez'}),88,19,7,regular,ink);
  write('CÓDIGO  '+meta.code,205,19,7,regular,muted);
  const n=qr.length,cell=1.65,left=505,bottom=45;page.drawRectangle({x:left-5,y:bottom-5,width:46,height:46,color:rgb(1,1,1)});
  qr.forEach((row,r)=>row.forEach((dark,c)=>{if(dark)page.drawRectangle({x:left+c*cell,y:bottom+(n-r-1)*cell,width:cell+.02,height:cell+.02,color:wine});}));
  write('VALIDACIÓN QR',489,37,5,bold,muted);
  const link=pdf.context.register(pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[485,35,552,113],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(meta.validationUrl)}}));page.node.addAnnot(link);
 }
 newPage(true);
 for(const grade of data.grades){
  const module=wrap(printable(grade.module),regular,7,355),title=wrap(printable(grade.title),regular,9,355),h=module.length*9+title.length*11+14;
  if(y-h<142){footer();newPage(false);}
  module.forEach((s,i)=>write(s,56,y-i*9,7,regular,muted));
  title.forEach((s,i)=>write(s,56,y-module.length*9-2-i*11,9,regular,ink));
  const score=grade.score===null?'Pendiente':String(grade.score)+' / 10';
  write(score,455,y-12,9,grade.score===null?regular:bold,grade.score===null?muted:wine);
  y-=h;page.drawLine({start:{x:52,y:y+8},end:{x:548,y:y+8},thickness:.45,color:border});
 }
 if(y<155){footer();newPage(false);}
 page.drawRectangle({x:43,y:y-32,width:509,height:43,color:rose});
 write('PROMEDIO DEL PERIODO',57,y-15,8,bold,muted);
 write(data.average===null?'SIN CALIFICACIONES':String(data.average)+' / 10',423,y-18,15,bold,wine);
 write('Dirección General  ·  Evolva Academy',43,91,7,bold,muted);
 write('Alexis Soto',43,68,18,await pdf.embedFont(StandardFonts.TimesRomanItalic),wine);
 footer();pages.forEach((p,i)=>{page=p;write('PÁG. '+(i+1)+' / '+pages.length,420,19,6,regular,muted);});
 return pdf.save();
}