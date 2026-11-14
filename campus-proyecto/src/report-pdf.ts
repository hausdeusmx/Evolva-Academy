import {studentMatricula} from './student-identity';
import {PDFDocument,degrees,rgb,PDFString,pushGraphicsState,popGraphicsState,rectangle,clip,endPath,type PDFFont} from 'pdf-lib';
import qrcode from 'qrcode-generator';
import fontkit from '@pdf-lib/fontkit';
import {reportFonts} from './report-fonts.ts';
import {logoJpegBase64} from './brand.ts';
import {REPORT_TITLE} from './report-record.ts';

export const documentColors={wine:rgb(70/255,10/255,18/255),ink:rgb(.17,.14,.14),muted:rgb(.43,.39,.39),rose:rgb(.965,.965,.965),border:rgb(.86,.84,.84),gold:rgb(.43,.17,.20),white:rgb(1,1,1)};
// Keep Spanish names and accents. Embedded Unicode fonts handle their glyphs.
export const documentText=(value:unknown)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim();
export function wrapDocumentText(value:unknown,font:PDFFont,size:number,width:number){
 const words=documentText(value).split(' '),out:string[]=[];let line='';
 for(const word of words){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)<=width){line=next;continue;}if(line)out.push(line);line='';for(const char of word){if(line&&font.widthOfTextAtSize(line+char,size)>width){out.push(line);line='';}line+=char;}}
 if(line)out.push(line);return out.length?out:[''];
}
export function documentDate(value:unknown){const raw=String(value||'');if(!raw)return 'No registrada';const date=new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw)?raw+'T12:00:00':raw);return Number.isFinite(date.getTime())?date.toLocaleDateString('es-MX',{timeZone:'America/Ciudad_Juarez',day:'2-digit',month:'short',year:'numeric'}):'No registrada';}
export function documentDuration(data:any){const plan=data.plan||{};const weeks=Number(plan.weeks),months=Number(plan.months);return Number.isFinite(weeks)&&weeks>0?weeks+' semanas':Number.isFinite(months)&&months>0?months+' meses':'No registrada';}
export function qrMatrix(url:string){const qr=qrcode(0,'M');qr.addData(url,'Byte');qr.make();const n=qr.getModuleCount();return Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>qr.isDark(r,c)));}
export async function createDocumentKit(title:string,issuedAt?:string){
 const pdf=await PDFDocument.create();pdf.setTitle(title);pdf.setAuthor('Evolva Academy');pdf.setCreator('Evolva Academy · Documentos 36');if(issuedAt&&Number.isFinite(Date.parse(issuedAt)))pdf.setCreationDate(new Date(issuedAt));pdf.registerFontkit(fontkit);
 const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),signature=await pdf.embedFont(bytes(reportFonts.signature),{subset:true}),serif=await pdf.embedFont(bytes(reportFonts.serif),{subset:true}),logo=await pdf.embedJpg(bytes(logoJpegBase64));
 const {wine,ink,muted,border,white}=documentColors;
 const write=(page:any,value:unknown,x:number,y:number,size=10,font=regular,color=ink)=>page.drawText(documentText(value),{x,y,size,font,color});
 const lines=(page:any,value:unknown,x:number,y:number,size:number,width:number,font=regular,color=ink,leading=size*1.35)=>{const rows=wrapDocumentText(value,font,size,width);rows.forEach((row,i)=>write(page,row,x,y-i*leading,size,font,color));return rows.length*leading;};
 const brand=(page:any,x:number,y:number,width:number)=>{const scale=width/1840,height=620*scale;page.pushOperators(pushGraphicsState(),rectangle(x,y,width,height),clip(),endPath());page.drawImage(logo,{x:x-110*scale,y:y+(720+620)*scale-2048*scale,width:2048*scale,height:2048*scale});page.pushOperators(popGraphicsState());};
 const qr=(page:any,url:string,x:number,y:number,size:number)=>{if(!/^https:\/\//i.test(url))throw Error('El enlace del QR debe usar HTTPS.');const matrix=qrMatrix(url),cell=size/(matrix.length+8);page.drawRectangle({x,y,width:size,height:size,color:white});matrix.forEach((row,r)=>row.forEach((dark,c)=>{if(dark)page.drawRectangle({x:x+(c+4)*cell,y:y+(matrix.length-r+3)*cell,width:cell+.01,height:cell+.01,color:ink});}));const link=pdf.context.register(pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[x,y,x+size,y+size],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(url)}}));page.node.addAnnot(link);};
 const field=(page:any,label:string,value:unknown,x:number,y:number,width=220)=>{write(page,label.toUpperCase(),x,y,6.8,bold,muted);return lines(page,value||'No registrado',x,y-16,9.5,width);};
 const sign=(page:any,x:number,y:number)=>{page.drawText('Alexis Soto',{x,y:y+24,size:24,font:signature,color:wine,xSkew:degrees(12)});page.drawLine({start:{x,y:y+12},end:{x:x+178,y:y+12},thickness:.6,color:border});write(page,'Alexis Soto',x,y,9,bold);write(page,'Director General · Evolva Academy',x,y-14,7.5,regular,muted);};
 // Original botanical motif shared by every document, drawn as vectors for print.
 const ornament=(page:any,x:number,y:number,height:number,width=23,color=wine,opacity=1)=>{page.drawLine({start:{x:x+width/2,y},end:{x:x+width/2,y:y+height},thickness:.65,color,opacity});for(let j=6;j<height-14;j+=25){const mid=x+width/2;page.drawSvgPath('M 0 0 C -12 -1 -12 -13 -11 -17 C -1 -15 3 -7 0 0 Z',{x:mid,y:y+j+18,scale:width/25,color,opacity});page.drawSvgPath('M 0 0 C 12 -1 12 -13 11 -17 C 1 -15 -3 -7 0 0 Z',{x:mid,y:y+j+8,scale:width/25,color,opacity});}};
 const center=(page:any,value:unknown,y:number,size:number,width:number,font=regular,color=ink,cx=(page.getWidth()-30)/2,maxRows=2)=>{let actual=size;while(wrapDocumentText(value,font,actual,width).length>maxRows&&actual>7)actual-=.25;const rows=wrapDocumentText(value,font,actual,width);if(rows.length>maxRows)throw Error('El texto excede el espacio del documento. Solicita revisión a administración.');rows.forEach((row,i)=>write(page,row,cx-font.widthOfTextAtSize(row,actual)/2,y-i*actual*1.3,actual,font,color));return rows.length*actual*1.3;};
 const header=(page:any,label:string)=>{const w=page.getWidth(),h=page.getHeight();page.drawRectangle({x:0,y:h-118,width:w,height:118,color:wine});page.drawRectangle({x:0,y:h-123,width:w,height:5,color:documentColors.rose});brand(page,42,h-83,146);write(page,'DOCUMENTOS ESCOLARES',w-221,h-48,7,bold,white);write(page,label,w-221,h-67,6.5,regular,white);page.drawLine({start:{x:w-221,y:h-83},end:{x:w-42,y:h-83},thickness:.6,color:documentColors.gold});};
 const footer=(page:any,index:number,count:number,note='Servicios escolares')=>{const w=page.getWidth();page.drawLine({start:{x:40,y:47},end:{x:w-40,y:47},thickness:.5,color:border});page.drawRectangle({x:40,y:20,width:3,height:17,color:wine});write(page,'EVOLVA ACADEMY  /  '+note.toUpperCase(),51,32,6.2,bold,muted);write(page,'soporte@evolvacademy.mx',51,20,6.2,regular,muted);write(page,String(index).padStart(2,'0')+' / '+String(count).padStart(2,'0'),w-71,27,7,bold,wine);};
 return {pdf,regular,bold,serif,signature,write,lines,brand,qr,field,sign,ornament,center,header,footer};
}
export async function createAcademicReportPDF(data:any,meta:{code:string,issuedAt:string,validationUrl:string}){
 const k=await createDocumentKit(REPORT_TITLE,meta.issuedAt),{pdf,regular,bold,serif,write,lines,qr,field,sign,header,footer:pageFooter}=k,{wine,muted,rose,border,gold,white}=documentColors;
 const grades=data.grades||[],pages:any[]=[];let page:any,y=0;
 function newPage(first:boolean){
  page=pdf.addPage([595.28,841.89]);pages.push(page);header(page,'CONTROL ACADÉMICO / CALIFICACIONES');write(page,'Reporte académico',40,692,28,serif,wine);write(page,'DE CALIFICACIONES',40,671,8,bold,muted);if(data.demo)write(page,'MUESTRA · SIN VALIDEZ ACADÉMICA',40,651,7,bold,gold);
  if(first){
   let nameSize=19;while(wrapDocumentText(data.student.name,bold,nameSize,515).length>2&&nameSize>9)nameSize-=.5;const used=lines(page,data.student.name,40,618,nameSize,515,bold,wine,nameSize*1.2);y=618-used-14;
   field(page,'Matrícula',studentMatricula(data.student),40,y,245);field(page,'Grupo',data.student.group||'Por asignar',320,y,230);y-=45;
   y-=Math.max(36,field(page,'Curso',data.student.course,40,y,515)+18);
   // Complementary data from the current account; the registered academic snapshot stays intact.
   if(data.student.registered||data.student.status){field(page,'Inscripción',documentDate(data.student.registered),40,y,245);field(page,'Estado de inscripción',data.student.status||'No registrado',320,y,230);y-=45;}
   page.drawRectangle({x:40,y:y-28,width:515,height:49,color:rose});const stats=[['PROMEDIO',data.average==null?'Pendiente':data.average+' / 10'],['AVANCE',(data.progress??0)+'%'],['EVALUADAS',grades.filter((g:any)=>g.score!==null).length+' / '+grades.length]];stats.forEach(([label,value],i)=>{write(page,label,53+i*173,y+7,6.8,bold,muted);write(page,value,53+i*173,y-12,14,bold,wine);});y-=53;
  }else{lines(page,data.student.name,40,591,11,515,bold);lines(page,studentMatricula(data.student)+' · '+data.student.course,40,569,8,515,regular,muted);y=533;}
  page.drawRectangle({x:40,y:y-8,width:515,height:25,color:wine});write(page,'MÓDULO / EVALUACIÓN',52,y,7,bold,white);write(page,'NOTA / 10',424,y,7,bold,white);write(page,'ESTADO',489,y,7,bold,white);y-=28;
 }
 function footer(){page.drawLine({start:{x:40,y:172},end:{x:555,y:172},thickness:.7,color:border});sign(page,40,114);write(page,'Firma tipográfica institucional',40,85,6.5,regular,muted);qr(page,meta.validationUrl,470,71,84);write(page,'VERIFICAR REPORTE',467,59,6.1,bold,muted);write(page,'Escala 0 a 10 · Promedio de evaluaciones registradas.',40,69,6.5,regular,muted);write(page,'Código: '+meta.code,40,56,6.3,regular,muted);}
 newPage(true);
 for(const grade of grades){const module=wrapDocumentText(grade.module,regular,7,351),title=wrapDocumentText(grade.title,regular,8.7,351),h=Math.max(32,module.length*9+title.length*11+12);if(y-h<184){footer();newPage(false);}lines(page,grade.module,52,y,7,351,regular,muted,9);lines(page,grade.title,52,y-module.length*9-2,8.7,351,regular,documentColors.ink,11);write(page,grade.score===null?'—':grade.score,431,y-12,10,bold,wine);write(page,grade.score===null?'Pendiente':grade.score>=7?'Aprobado':'Revisar',488,y-11,6.8,regular,muted);y-=h;page.drawLine({start:{x:40,y:y+9},end:{x:555,y:y+9},thickness:.4,color:border});}
 if(!grades.length)write(page,'Sin calificaciones registradas a la fecha de emisión.',52,y,9,regular,muted);footer();pages.forEach((p,i)=>pageFooter(p,i+1,pages.length,'Emisión '+documentDate(meta.issuedAt)));return pdf.save();
}
