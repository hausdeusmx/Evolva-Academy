import {PDFDocument,StandardFonts,rgb,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {reportFonts} from './report-fonts';
import {logoJpegBase64} from './brand';

const wine=rgb(.055,.12,.22),ink=rgb(.10,.17,.24),muted=rgb(.36,.45,.52);
const rose=rgb(.91,.96,.97),border=rgb(.76,.85,.88),cream=rgb(.995,.999,1),white=rgb(1,1,1),accent=rgb(.08,.62,.66);
const bytes=(value:string)=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
function printable(value:string){return String(value||'').replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\xFF\u20AC]/g,'');}
function wrap(value:string,font:PDFFont,size:number,width:number){
 const words=printable(value).replace(/\s+/g,' ').trim().split(' '),out:string[]=[];let line='';
 for(const word of words){const candidate=line?line+' '+word:word;if(font.widthOfTextAtSize(candidate,size)<=width){line=candidate;continue;}if(line)out.push(line);line='';for(const char of word){if(font.widthOfTextAtSize(line+char,size)>width){if(line)out.push(line);line='';}line+=char;}}
 if(line)out.push(line);return out.length?out:[''];
}
export async function createCompletionCertificatePDF(data:any):Promise<Uint8Array>{
 const student=data.student||{},pdf=await PDFDocument.create();
 pdf.registerFontkit(fontkit);
 pdf.setTitle('Constancia de finalización - '+String(student.folio||'Evolva Academy'));
 pdf.setAuthor('Evolva Academy');pdf.setSubject('Constancia de finalización emitida por el Campus privado');
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true});
 const bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true});
 const signature=await pdf.embedFont(StandardFonts.TimesRomanItalic);
 const logo=await pdf.embedJpg(bytes(logoJpegBase64));
 const page=pdf.addPage([841.89,595.28]),{width,height}=page.getSize();
 page.drawRectangle({x:0,y:0,width,height,color:cream});page.drawRectangle({x:0,y:height-8,width,height:8,color:accent});
 page.drawRectangle({x:20,y:20,width:width-40,height:height-40,borderColor:wine,borderWidth:2});
 page.drawRectangle({x:27,y:27,width:width-54,height:height-54,borderColor:border,borderWidth:.8});page.drawCircle({x:55,y:height-55,size:12,borderColor:accent,borderWidth:1});page.drawCircle({x:width-55,y:height-55,size:12,borderColor:accent,borderWidth:1});page.drawCircle({x:55,y:55,size:12,borderColor:accent,borderWidth:1});page.drawCircle({x:width-55,y:55,size:12,borderColor:accent,borderWidth:1});
 page.drawRectangle({x:0,y:height-104,width,height:104,color:wine});
 const logoScale=156/1840;
 page.drawImage(logo,{x:48-110*logoScale,y:height-86+(720+620)*logoScale-2048*logoScale,width:2048*logoScale,height:2048*logoScale});
 const write=(value:string,x:number,y:number,size=10,font=regular,color=ink)=>page.drawText(printable(value),{x,y,size,font,color});
 const centered=(value:string,y:number,size:number,font=regular,color=ink)=>write(value,(width-font.widthOfTextAtSize(printable(value),size))/2,y,size,font,color);
 write('CAMPUS VIRTUAL  /  SERVICIOS ESCOLARES',width-270,height-50,7,regular,rgb(.96,.88,.90));
 write('DOCUMENTO ACADÉMICO OFICIAL',width-270,height-68,8,bold,white);
 centered('CONSTANCIA DE FINALIZACIÓN',height-151,24,bold,wine);
 page.drawLine({start:{x:250,y:height-168},end:{x:width-250,y:height-168},thickness:1,color:border});
 centered('Se hace constar que',height-205,12,regular,muted);
 const name=printable(student.name||'Alumno');let nameSize=28;
 while(bold.widthOfTextAtSize(name,nameSize)>width-150&&nameSize>17)nameSize-=1;
 centered(name,height-250,nameSize,bold,wine);
 centered('ha concluido satisfactoriamente las actividades académicas',height-284,12,regular,ink);
 centered('correspondientes al programa de formación:',height-303,12,regular,ink);
 const courseLines=wrap(student.course||'Programa académico',bold,17,width-180);
 courseLines.slice(0,2).forEach((line,i)=>centered(line,height-339-i*23,17,bold,wine));
 const detailY=height-407;
 page.drawRectangle({x:118,y:detailY-22,width:width-236,height:47,color:rose});
 const details=[
  {label:'MATRÍCULA',value:String(student.folio||'—'),x:145,w:180},
  {label:'GRUPO',value:String(student.group||'Sin asignar'),x:365,w:150},
  {label:'AVANCE',value:String(data.progress??0)+'%',x:555,w:100},
  {label:'PROMEDIO',value:data.average===null||data.average===undefined?'—':String(data.average)+' / 10',x:685,w:120}
 ];
 details.forEach(item=>{write(item.label,item.x,detailY+9,6.5,bold,muted);let size=10;while(bold.widthOfTextAtSize(printable(item.value),size)>item.w&&size>7)size-=.5;write(item.value,item.x,detailY-7,size,bold,wine);});
 const date=new Date(data.issuedAt||Date.now()).toLocaleDateString('es-MX',{timeZone:'America/Ciudad_Juarez',day:'numeric',month:'long',year:'numeric'});
 centered('Se expide la presente para los fines académicos y administrativos que al interesado convengan.',height-465,8.5,regular,muted);
 page.drawLine({start:{x:125,y:91},end:{x:315,y:91},thickness:.7,color:border});
 write('Alexis Soto',155,108,20,signature,wine);
 write('Alexis Soto · Director General',130,75,8,bold,ink);
 write('EVOLVA ACADEMY',130,61,7,regular,muted);
 write('FECHA DE EMISIÓN',width-270,108,6.5,bold,muted);
 write(date,width-270,91,10,bold,wine);
 write(data.demo?'MUESTRA DE PRUEBA · SIN VALIDEZ ACADÉMICA':'Emitida desde el registro académico privado de Evolva Academy.',width-270,69,7,regular,muted);
 if(data.demo)centered('DOCUMENTO DE PRUEBA - SIN VALIDEZ ACADÉMICA',height-126,8,bold,rgb(.62,.30,.12));
 return pdf.save();
}
