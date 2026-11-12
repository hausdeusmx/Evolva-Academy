export const studentMatricula=(student:any):string=>String(student?.matricula||student?.accountFolio||student?.folio||'');

export function ownStudentLookup(data:any,query:string){if(!data?.student||String(query||'').trim().toUpperCase()!==studentMatricula(data.student).trim().toUpperCase())return null;return {student:data.student,average:data.average,progress:data.progress};}
