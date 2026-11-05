import {PDFDocument,StandardFonts,rgb,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {reportFonts} from './report-fonts';
import {logoJpegBase64} from './brand';
const wine=rgb(.314,.047,.09),ink=rgb(.20,.13,.15),muted=rgb(.43,.34,.37),rose=rgb(.965,.925,.935),border=rgb(.87,.79,.82),cream=rgb(.995,.99,.985),white=rgb(1,1,1),accent=rgb(.72,.48,.53);
const bytes=(v:string)=>Uint8Array.from(atob(v),c=>c.charCodeAt(0));
function printable(v:string){return String(v||'').replace(/[\\u2013\\u2014]/g,'-').replace(/[^\\x20-\\xFF\\u20AC]/g,'');}
function wrap(v:string,font:PDFFont,size:number,width:number){const out:string[]=[];let line='';for(const word of printable(v).trim().split(/\\s+/)){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)<=width){line=next;continue;}if(line)out.push(line);line=word;}if(line)out.push(line);return out.length?out:[''];}
export async function createCompletionCertificatePDF(data:any):Promise<Uint8Array>{
 const student=data.student||{},pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
 pdf.setTitle('Constancia de finalización - '+String(student.folio||'Evolva Academy'));pdf.setAuthor('Evolva Academy');pdf.setSubject('Constancia de finalización emitida por el Campus privado');
 const regular=await pdf.embedFont(bytes(reportFonts.regular),{subset:true}),bold=await pdf.embedFont(bytes(reportFonts.bold),{subset:true}),signature=await pdf.embedFont(StandardFonts.TimesRomanItalic),logo=await pdf.embedJpg(bytes(logoJpegBase64));
 const page=pdf.addPage([841.89,595.28]),{width,height}=page.getSize();
 page.drawRectangle({x:0,y:0,width,height,color:cream});
 // A completely new asymmetrical diploma composition: editorial side panel and open central field.
 page.drawRectangle({x:0,y:0,width:188,height,color:wine});page.drawRectangle({x:180,y:0,width:8,height,color:accent});
 page.drawImage(logo,{x:28,y:height-115,width:130,height:92});
 const write=(v:string,x:number,y:number,size=10,font=regular,color=ink)=>page.drawText(printable(v),{x,y,size,font,color});
 const centered=(v:string,y:number,size:number,font=regular,color=ink)=>write(v,(width+188-font.widthOfTextAtSize(printable(v),size))/2,y,size,font,color);
 write('EVOLVA',38,355,22,bold,white);write('ACADEMY',38,329,22,bold,white);
 page.drawLine({start:{x:35,y:304},end:{x:153,y:304},thickness:1,color:accent});
 write('SERVICIOS',38,280,7,bold,white);write('ESCOLARES',38,267,7,bold,white);
 write('DOCUMENTO',38,90,6,bold,rgb(.92,.80,.84));write('EA  /  01',38,73,10,bold,white);
 const centerX=188,mainW=width-centerX;
 write('ACADEMIC RECORDS     /     CAMPUS VIRTUAL',226,541,7,bold,muted);
 write('RECONOCIMIENTO',226,489,10,bold,accent);
 write('CONSTANCIA',226,448,31,bold,wine);
 write('DE FINALIZACIÓN',226,416,21,regular,ink);
 page.drawLine({start:{x:226,y:393},end:{x:width-54,y:393},thickness:1,color:border});
 write('Se certifica que',226,362,11,regular,muted);
 const name=printable(student.name||'Alumno');let nameSize=27;while(bold.widthOfTextAtSize(name,nameSize)>mainW-90&&nameSize>17)nameSize--;
 wrap(name,bold,nameSize,mainW-90).slice(0,2).forEach((s,i)=>write(s,226,320-i*(nameSize+5),nameSize,bold,wine));
 const nameHeight=wrap(name,bold,nameSize,mainW-90).length>1?2*(nameSize+5):nameSize+5;
 const introY=320-nameHeight-9;
 write('ha concluido satisfactoriamente el programa académico',226,introY,10,regular,ink);
 const course=wrap(student.course||'Programa académico',bold,16,mainW-90);
 course.slice(0,2).forEach((s,i)=>write(s,226,introY-34-i*21,16,bold,wine));
 const infoY=132;
 page.drawRectangle({x:226,y:infoY-15,width:mainW-80,height:52,color:rose});
 const items=[['MATRÍCULA',String(student.folio||'—')],['GRUPO',String(student.group||'Sin asignar')],['AVANCE',String(data.progress??0)+'%'],['PROMEDIO',data.average==null?'—':String(data.average)+' / 10']];
 items.forEach((it,i)=>{const x=244+i*142;write(it[0],x,infoY+20,6,bold,muted);write(it[1],x,infoY,9,bold,wine);});
 page.drawLine({start:{x:226,y:68},end:{x:390,y:68},thickness:.7,color:border});
 write('Alexis Soto',232,83,17,signature,wine);write('DIRECCIÓN GENERAL',226,54,6,bold,muted);
 write('FECHA DE EMISIÓN',520,82,6,bold,muted);
 const date=new Date(data.issuedAt||Date.now()).toLocaleDateString('es-MX',{timeZone:'America/Ciudad_Juarez',day:'numeric',month:'long',year:'numeric'});
 write(date,520,65,9,bold,ink);
 if(data.demo){page.drawRectangle({x:520,y:34,width:260,height:16,color:rose});write('MUESTRA DE PRUEBA · SIN VALIDEZ ACADÉMICA',526,39,6,bold,wine);}
 else write('Emitida desde el registro académico privado.',520,43,6,regular,muted);
 return pdf.save();
}