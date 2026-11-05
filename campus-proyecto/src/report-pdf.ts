import {PDFDocument,StandardFonts,rgb,PDFString,pushGraphicsState,popGraphicsState,rectangle,clip,endPath,type PDFFont} from 'pdf-lib';
import qrcode from 'qrcode-generator';
import fontkit from '@pdf-lib/fontkit';
import {reportFonts} from './report-fonts.ts';
import {logoJpegBase64} from './brand.ts';
import {REPORT_TITLE} from './report-record.ts';

export const documentColors={wine:rgb(72/255,10/255,21/255),ink:rgb(.19,.14,.16),muted:rgb(.46,.38,.41),rose:rgb(.97,.94,.95),border:rgb(.87,.81,.83),gold:rgb(.68,.51,.32),white:rgb(1,1,1)};
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
 const pdf=await PDFDocument.create();pdf.setTitle(title);pdf.setAuthor('Evolva Academy');pdf.setCreator('Evolva Academy · Servicios Escolares');if(issuedAt&&Number.isFinite(Date.parse(issuedAt)))pdf.setCreationDate(new Date(issuedAt));pdf.registerFontkit(fontkit);
 const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),signature=await pdf.embedFont(StandardFonts.TimesRomanItalic),logo=await pdf.embedJpg(bytes(logoJpegBase64));
 const {wine,ink,muted,border,white}=documentColors;
 const write=(page:any,value:unknown,x:number,y:number,size=10,font=regular,color=ink)=>page.drawText(documentText(value),{x,y,size,font,color});
 const lines=(page:any,value:unknown,x:number,y:number,size:number,width:number,font=regular,color=ink,leading=size*1.35)=>{const rows=wrapDocumentText(value,font,size,width);rows.forEach((row,i)=>write(page,row,x,y-i*leading,size,font,color));return rows.length*leading;};
 const brand=(page:any,x:number,y:number,width:number)=>{const scale=width/1840,height=620*scale;page.pushOperators(pushGraphicsState(),rectangle(x,y,width,height),clip(),endPath());page.drawImage(logo,{x:x-110*scale,y:y+(720+620)*scale-2048*scale,width:2048*scale,height:2048*scale});page.pushOperators(popGraphicsState());};
 const qr=(page:any,url:string,x:number,y:number,size:number)=>{if(!/^https:\/\//i.test(url))throw Error('El enlace del QR debe usar HTTPS.');const matrix=qrMatrix(url),cell=size/(matrix.length+8);page.drawRectangle({x,y,width:size,height:size,color:white});matrix.forEach((row,r)=>row.forEach((dark,c)=>{if(dark)page.drawRectangle({x:x+(c+4)*cell,y:y+(matrix.length-r+3)*cell,width:cell+.01,height:cell+.01,color:ink});}));const link=pdf.context.register(pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[x,y,x+size,y+size],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(url)}}));page.node.addAnnot(link);};
 const field=(page:any,label:string,value:unknown,x:number,y:number,width=220)=>{write(page,label.toUpperCase(),x,y,6.8,bold,muted);return lines(page,value||'No registrado',x,y-16,9.5,width);};
 const sign=(page:any,x:number,y:number)=>{write(page,'Alexis Soto',x,y+24,24,signature,wine);page.drawLine({start:{x,y:y+12},end:{x:x+178,y:y+12},thickness:.6,color:border});write(page,'Alexis Soto',x,y,9,bold);write(page,'Director General · Evolva Academy',x,y-14,7.5,regular,muted);};
 return {pdf,regular,bold,signature,write,lines,brand,qr,field,sign};
}
export async function createAcademicReportPDF(data:any,meta:{code:string,issuedAt:string,validationUrl:string}){
 const k=await createDocumentKit(REPORT_TITLE,meta.issuedAt),{pdf,regular,bold,write,lines,brand,qr,field,sign}=k,{wine,muted,rose,border,gold,white}=documentColors;
 const grades=data.grades||[],pages:any[]=[];let page:any,y=0;
 function newPage(first:boolean){
  page=pdf.addPage([595.28,841.89]);pages.push(page);page.drawRectangle({x:0,y:730,width:595.28,height:112,color:wine});brand(page,40,756,200);write(page,'SERVICIOS ESCOLARES',386,790,7.5,bold,white);write(page,'BOLETA ACADÉMICA',386,774,7,regular,white);page.drawLine({start:{x:40,y:710},end:{x:555,y:710},thickness:1.4,color:gold});
  write(page,'Reporte académico',40,676,24,bold,wine);write(page,'de calificaciones',40,646,24,bold,wine);if(data.demo)write(page,'MUESTRA · SIN VALIDEZ ACADÉMICA',40,625,7.5,bold,gold);
  if(first){
   let nameSize=19;while(wrapDocumentText(data.student.name,bold,nameSize,515).length>2&&nameSize>9)nameSize-=.5;const used=lines(page,data.student.name,40,592,nameSize,515,bold,wine,nameSize*1.2);y=592-used-8;
   field(page,'Matrícula / folio',data.student.folio,40,y,245);field(page,'Grupo',data.student.group||'Por asignar',320,y,230);y-=42;
   y-=Math.max(36,field(page,'Curso',data.student.course,40,y,515)+18);
   // Complementary data from the current account; the registered academic snapshot stays intact.
   if(data.student.registered||data.student.status){field(page,'Inscripción',documentDate(data.student.registered),40,y,245);field(page,'Estado de inscripción',data.student.status||'No registrado',320,y,230);y-=41;}
   page.drawRectangle({x:40,y:y-28,width:515,height:49,color:rose});const stats=[['PROMEDIO',data.average==null?'Pendiente':data.average+' / 10'],['AVANCE',(data.progress??0)+'%'],['EVALUADAS',grades.filter((g:any)=>g.score!==null).length+' / '+grades.length]];stats.forEach(([label,value],i)=>{write(page,label,53+i*173,y+7,6.8,bold,muted);write(page,value,53+i*173,y-12,14,bold,wine);});y-=53;
  }else{lines(page,data.student.name,40,591,11,515,bold);lines(page,data.student.folio+' · '+data.student.course,40,569,8,515,regular,muted);y=533;}
  page.drawRectangle({x:40,y:y-8,width:515,height:25,color:wine});write(page,'MÓDULO / EVALUACIÓN',52,y,7,bold,white);write(page,'NOTA / 10',424,y,7,bold,white);write(page,'ESTADO',489,y,7,bold,white);y-=28;
 }
 function footer(){page.drawLine({start:{x:40,y:168},end:{x:555,y:168},thickness:.7,color:border});sign(page,40,106);qr(page,meta.validationUrl,469,64,86);write(page,'VALIDAR REPORTE',466,53,6.5,bold,muted);write(page,'Escala 0 a 10 · Promedio de evaluaciones registradas.',40,65,6.8,regular,muted);write(page,'Código: '+meta.code,40,43,6.5,regular,muted);write(page,'Emisión: '+documentDate(meta.issuedAt),40,27,7,regular,muted);write(page,'Firma tipográfica institucional · El QR consulta el registro protegido.',40,14,6.2,regular,muted);}
 newPage(true);
 for(const grade of grades){const module=wrapDocumentText(grade.module,regular,7,351),title=wrapDocumentText(grade.title,regular,8.7,351),h=Math.max(32,module.length*9+title.length*11+12);if(y-h<184){footer();newPage(false);}lines(page,grade.module,52,y,7,351,regular,muted,9);lines(page,grade.title,52,y-module.length*9-2,8.7,351,regular,documentColors.ink,11);write(page,grade.score===null?'—':grade.score,431,y-12,10,bold,wine);write(page,grade.score===null?'Pendiente':grade.score>=7?'Aprobado':'Revisar',488,y-11,6.8,regular,muted);y-=h;page.drawLine({start:{x:40,y:y+9},end:{x:555,y:y+9},thickness:.4,color:border});}
 if(!grades.length)write(page,'Sin calificaciones registradas a la fecha de emisión.',52,y,9,regular,muted);footer();pages.forEach((p,i)=>write(p,`${i+1} / ${pages.length}`,526,27,7,regular,muted));return pdf.save();
}
