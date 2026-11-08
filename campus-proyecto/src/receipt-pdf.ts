import {studentMatricula} from './student-identity';
import {createDocumentKit,documentColors,documentDate,wrapDocumentText} from './report-pdf';
export async function createReceiptPDF(data:any){
 const r=data.receipt;if(!r||!r.id||!r.student?.folio||!Number.isFinite(r.amount)||r.amount<=0)throw Error('El recibo no tiene datos válidos.');
 const k=await createDocumentKit('Recibo de pago '+r.id,r.issuedAt),{pdf,regular,bold,serif,write,lines,header,footer,ornament}=k,{wine,muted,rose,border,gold}=documentColors;
 const pages:any[]=[];let page:any,y=0;
 function next(){page=pdf.addPage([595.28,841.89]);pages.push(page);header(page,'TESORERÍA / CONTROL DE PAGOS');write(page,'Recibo de pago',40,690,31,serif,wine);y=660-lines(page,r.id,40,660,9,515,bold,muted,13)-19;ornament(page,520,330,280,20,wine,.045);}
 function ensure(h:number){if(y-h<120)next();}
 function field(label:string,value:any,size=10,font=regular){const rows=wrapDocumentText(value||'No registrado',font,size,487),h=rows.length*size*1.35+36;ensure(h);write(page,label,54,y-8,6.7,bold,muted);let rowY=y-23;for(const row of rows){if(rowY<125){y=0;next();rowY=y-15;}write(page,row,54,rowY,size,font,wine);rowY-=size*1.35;}page.drawLine({start:{x:40,y:rowY-6},end:{x:555,y:rowY-6},thickness:.5,color:border});y=rowY-13;}
 next();if(r.demo){write(page,'MUESTRA · DATOS FICTICIOS · SIN VALIDEZ',40,y,7,bold,gold);y-=27;}
 ensure(85);page.drawRectangle({x:40,y:y-70,width:515,height:78,color:rose});write(page,'IMPORTE CONFIRMADO',55,y-12,7,bold,muted);write(page,new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(r.amount),55,y-48,30,bold,wine);write(page,'MXN',506,y-46,9,bold,wine);y-=100;
 field('ALUMNO/A',r.student.name,18,bold);field('MATRÍCULA',studentMatricula(r.student),11,bold);field('CURSO / GRUPO',r.student.course+(r.student.group?' · '+r.student.group:''));field('CONCEPTO / PERIODO',r.period);field('REFERENCIA',r.reference||'Sin referencia');field('FECHA DE REGISTRO',documentDate(r.registeredAt));
 pages.forEach((p,i)=>{write(p,'Emitido: '+documentDate(r.issuedAt)+' · Registro interno: '+String(data.fingerprint||'').slice(0,32),40,98,6.5,regular,muted);write(p,'Recibo interno de pago. No es un comprobante fiscal.',40,78,7,regular,muted);footer(p,i+1,pages.length,'Recibo de pago');});return pdf.save();
}
