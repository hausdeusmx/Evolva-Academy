import {createDocumentKit,documentColors,documentDate,wrapDocumentText} from './report-pdf';
export async function createJustificationPDF(data:any):Promise<Uint8Array>{
 if(!data?.student?.name||!/^EVOLVA-\d{6}$/.test(data.student.matricula)||data.attendance?.status!=='JUSTIFICADA'||!data.attendance.id||!Number.isFinite(Date.parse(data.attendance.date)))throw Error('El justificante necesita una asistencia registrada como justificada.');
 const k=await createDocumentKit('Justificante de asistencia - Evolva Academy',data.issuedAt),{pdf,regular,bold,serif,write,brand,lines}=k,{wine,muted,rose,border,ink}=documentColors;
 let page=pdf.addPage([595.28,841.89]),y=690;const header=()=>{brand(page,44,747,164);write(page,'SERVICIOS ESCOLARES',365,780,8,bold,wine);write(page,'CONTROL DE ASISTENCIA',365,765,7,regular,muted);page.drawLine({start:{x:44,y:728},end:{x:551,y:728},thickness:1,color:border});};header();
 write(page,'JUSTIFICANTE',44,y,30,serif,wine);write(page,'DE ASISTENCIA',44,y-26,11,bold,wine);y-=67;
 const paragraph=(text:string,size=10,font=regular,color=ink)=>{const rows=wrapDocumentText(text,font,size,467);for(const row of rows){if(y-size<112){page=pdf.addPage([595.28,841.89]);header();write(page,'JUSTIFICANTE · CONTINUACIÓN',44,695,10,bold,wine);y=665;}write(page,row,64,y,size,font,color);y-=size*1.6;}y-=15;};
 const panelHeight=105+wrapDocumentText(data.student.name,bold,14,467).length*22.4,panelBottom=y+20-panelHeight;page.drawRectangle({x:44,y:panelBottom,width:507,height:panelHeight,color:rose});paragraph('ALUMNO',7,bold,muted);paragraph(data.student.name,14,bold,wine);paragraph('Matrícula '+data.student.matricula,9);y=Math.min(y-20,panelBottom-33);
 paragraph('Evolva Academy hace constar que el control de asistencia registra el siguiente estado para la clase indicada:');
 for(const [label,value] of [['Curso',data.student.course],['Grupo',data.student.group],['Clase',data.attendance.title],['Fecha de la clase',documentDate(data.attendance.date)],['Estado','FALTA JUSTIFICADA']])paragraph(label+': '+String(value||'Sin registrar'),10,label==='Estado'?bold:regular,label==='Estado'?wine:ink);
 paragraph(data.notice||'Este documento refleja exclusivamente el estado de asistencia registrado para esta clase.',8,regular,muted);
 y-=9;paragraph('Fuente: control de asistencia de Evolva Academy. Consulta emitida el '+documentDate(data.issuedAt)+'.',8,regular,muted);paragraph('Referencia de clase: '+data.attendance.id,7,regular,muted);
 pdf.getPages().forEach((p,i)=>{p.drawLine({start:{x:44,y:77},end:{x:551,y:77},thickness:1,color:border});write(p,'EVOLVA ACADEMY · DOCUMENTO ESCOLAR',44,58,7,bold,wine);write(p,'soporte@evolvacademy.mx',44,44,7,regular,muted);write(p,(i+1)+' / '+pdf.getPageCount(),526,44,7,regular,muted);if(data.demo)write(p,'MUESTRA · SIN VALIDEZ',342,58,8,bold,wine);});
 return pdf.save();
}
