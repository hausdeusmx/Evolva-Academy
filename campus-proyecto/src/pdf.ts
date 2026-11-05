import { logoJpegBase64 } from './brand.ts';
// Self-contained PDF generation using standard WinAnsi Helvetica fonts.
function clean(s:string){return s.replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\xFF]/g,'').replace(/([\\()])/g,'\\$1');}
export function makePDF(data:any,kind:string){
 const pages:string[]=[];const batches:any[][]=[];if(kind==='boleta'){batches.push(data.grades.slice(0,7));for(let i=7;i<data.grades.length;i+=14)batches.push(data.grades.slice(i,i+14));}else batches.push([]);
 batches.forEach((grades,page)=>{
 const c:string[]=[];const rect=(x:number,y:number,w:number,h:number,color:string)=>c.push(`${color} rg ${x} ${y} ${w} ${h} re f`);
 const text=(s:string,x:number,y:number,size=12,bold=false,color='0.21 0.14 0.16')=>c.push(`${color} rg BT /${bold?'F2':'F1'} ${size} Tf ${x} ${y} Td (${clean(String(s))}) Tj ET`);
 rect(0,0,595,842,'0.99 0.98 0.97');rect(0,687,595,155,'0.314 0.047 0.09');rect(42,656,511,2,'0.72 0.48 0.53');if(kind==='constancia'){rect(24,24,547,794,'0.72 0.48 0.53');rect(27,27,541,788,'0.99 0.98 0.97');rect(31,31,533,780,'0.314 0.047 0.09');rect(33,33,529,776,'0.99 0.98 0.97');}
 c.push('q 44 740 210 70.76 re W n 233.739 0 0 233.739 31.446 659.195 cm /Logo Do Q');text('EVOLVA ACADEMY',44,714,10,true,'1 1 1');text('CAMPUS VIRTUAL  /  SERVICIOS ESCOLARES',44,697,8,false,'0.96 0.88 0.90');
 text(kind==='constancia'?'CONSTANCIA DE FINALIZACIÓN':'BOLETA DE CALIFICACIONES',44,610,kind==='constancia'?24:21,true,'0.314 0.047 0.09');
 if(data.demo)text('DOCUMENTO DE PRUEBA - SIN VALIDEZ ACADÉMICA',44,581,10,true,'0.6 0.3 0.1');
 let start=555;
 if(page===0){text('Se hace constar que',44,530);text(data.student.name,44,495,Math.max(14,Math.min(25,900/Math.max(data.student.name.length,1))),true);text(`Matrícula: ${data.student.folio}`,44,465);text(`Curso: ${data.student.course}`,44,439);text(`Grupo: ${data.student.group||'Sin asignar'}`,44,413);start=365;}
 else {text(`${data.student.name} / ${data.student.folio}`,44,553,11,true);start=520;}
 if(kind==='constancia'){text('ha concluido satisfactoriamente las actividades',75,368,13,false,'0.35 0.25 0.28');text('académicas correspondientes al programa:',75,346,13,false,'0.35 0.25 0.28');text(data.student.course,75,309,18,true,'0.314 0.047 0.09');text(`Avance: ${data.progress}%     Promedio: ${data.average??'--'} / 10`,75,274,12,true,'0.35 0.25 0.28');text('Se expide la presente para los fines que al interesado convengan.',75,239,10,false,'0.35 0.25 0.28');}
 else {let y=start;for(const g of grades){const title=`${g.module}  ${g.title}`;text(title.slice(0,69),44,y,9);text(g.score===null?'Pendiente':`${g.score} / 10`,465,y,10,true);if(title.length>69)text(title.slice(69,138),44,y-11,8);y-=25;}if(page===batches.length-1)text(`Promedio: ${data.average??'--'} / 10`,44,y-17,13,true);}
 if(kind==='constancia'){text('Alexis Soto',44,164,16,true,'0.314 0.047 0.09');text('Director General',44,145,10);text('EVOLVA ACADEMY',44,127,9,true,'0.314 0.047 0.09');}
 text(data.demo?'Datos ficticios para validar el portal. No acredita estudios reales.':'Documento generado desde el registro autorizado de la institución.',44,93,9);
 text(`Emisión: ${new Date().toISOString().slice(0,10)}   |   ${data.student.folio}`,44,62,9);text(`Página ${page+1} de ${batches.length}`,469,62,8);pages.push(c.join('\n'));
 });
 const logoBytes=atob(logoJpegBase64);
 const objects=[`<< /Type /Catalog /Pages 2 0 R >>`,`<< /Type /Pages /Kids [${pages.map((_,i)=>`${6+i*2} 0 R`).join(' ')}] /Count ${pages.length} >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,`<< /Type /XObject /Subtype /Image /Width 2048 /Height 2048 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logoBytes.length} >>\nstream\n${logoBytes}\nendstream`];
 pages.forEach((stream,i)=>objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Logo 5 0 R >> >> /Contents ${7+i*2} 0 R >>`,`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`));
 let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(x=>`${String(x).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return Uint8Array.from(pdf,ch=>ch.charCodeAt(0));
}
