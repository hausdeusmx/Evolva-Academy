export async function schoolDocumentPDF(file:any):Promise<Uint8Array>{
 if(!file?.ok)throw Error('No se recibió el documento autorizado.');
 if(file.kind==='boleta'){const {createAcademicReportPDF}=await import('./report-pdf');return createAcademicReportPDF(file.snapshot,file.meta);}
 if(file.kind==='constancia'){if(file.base64){const b=Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0));if(String.fromCharCode(...b.slice(0,5))!=='%PDF-')throw Error('El archivo recibido no es un PDF.');return b;}const {createCompletionCertificatePDF}=await import('./certificate-pdf');return createCompletionCertificatePDF(file.data);}
 if(file.kind==='estudios'){const {createStudyLetterPDF}=await import('./study-pdf');return createStudyLetterPDF(file.data);}
 if(file.kind==='credencial'){const {createCredentialPDF}=await import('./credential-pdf');return createCredentialPDF(file.data);}
 if(file.kind==='justificante'){const {createJustificationPDF}=await import('./justification-pdf');return createJustificationPDF(file.data);}
 throw Error('Este documento no está disponible en PDF.');
}
